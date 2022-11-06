<!-- Form for creating freets -->
<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'CreateFreetForm',
  mixins: [BlockForm],
  data() {
    /**
     * Options for submitting this form.
     */
    return {
      url: '/api/freets',
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'intent', label: 'Intent', value: 'Share', defaultVal: 'Share', options: ['Share', 'Joke', 'Inform']},
        {id: 'supplement', label: 'Supplemental Link', value: '', defaultVal: ''},
        {id: 'tagLabels', label: 'Tags', value: '', defaultVal: ''},
        {id: 'content', label: 'Content', value: '', defaultVal: ''},
      ],
      title: 'Create a freet',
      refreshFreets: true,
      setUsername: false, // Whether or not stored username should be updated after form submission
      alerts: {}, // Displays success/error messages encountered during form submission
      callback: () => {
        const message = 'Successfully created a freet!';
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  },
  methods: {
    async submit() {
      /**
        * Submits a form with the specified options from data().
        */
      const options = {
        method: this.method,
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin' // Sends express-session credentials with request
      };
      if (this.hasBody) {
        options.body = JSON.stringify(Object.fromEntries(
          this.fields.map(field => {
            var {id, value} = field;
            if (id == 'tagLabels') {
              value = value.split(",");
            }
            field.value = field.defaultVal;
            return [id, value];
          })
        ));
      }

      try {
        var r = await fetch(this.url, options);
        if (!r.ok) {
          // If response is not okay, we throw an error and enter the catch block
          const res = await r.json();
          throw new Error(res.error);
        } else {
          // Create intent 
          var res = await r.json();
          const freetId = res.freet._id;
          r = await fetch(`/api/intent/${freetId}`, options);
          if (!r.ok) {
            res = await r.json();
            options.method = 'DELETE';
            r = await fetch(`/api/freets/${freetId}`, options);
            throw new Error(res.error);
          }

          // Create tags
          r = await fetch(`/api/tags/${freetId}`, options);
          if (!r.ok) {
            res = await r.json();
            options.method = 'DELETE';
            r = await fetch(`/api/freets/${freetId}`, options);
            throw new Error(res.error);
          }
        }

        if (this.setUsername) {
          const text = await r.text();
          const res = text ? JSON.parse(text) : {user: null};
          this.$store.commit('setUsername', res.user ? res.user.username : null);
          this.$store.commit('refreshCustomFilters');
        }

        if (this.refreshFreets) {
          this.$store.commit('refreshFreets');
        }

        if (this.callback) {
          this.callback();
        }
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
  }
};
</script>

<style scoped>
form {
  border: 1px solid #111;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 14px;
  position: relative;
}

article > div {
  display: flex;
  flex-direction: column;
}

form > article p {
  margin: 0;
}

form h3,
form > * {
  margin: 0.3em 0;
}

form h3 {
  margin-top: 0;
}

textarea {
   font-family: inherit;
   font-size: inherit;
}
</style>