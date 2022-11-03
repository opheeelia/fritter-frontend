<!-- Form for creating freets -->
<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'SuggestionForm',
  mixins: [BlockForm],
  data() {
    /**
     * Options for submitting this form.
     */
    return {
      url: `/api/suggestions/${this.freet}`,
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'intent', label: 'Intent', value: 'Share', defaultVal: 'Share', options: ['Share', 'Joke', 'Inform']},
        {id: 'supplement', label: 'Supplemental Link', value: '', defaultVal: ''},
        {id: 'content', label: 'Tags', value: '', defaultVal: ''},
      ],
      title: 'Make a suggestion',
      refreshFreets: true,
      alerts: {}, // Displays success/error messages encountered during form submission
      callback: () => {
        const message = 'Successfully made a suggestion';
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
            const {id, value} = field;
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