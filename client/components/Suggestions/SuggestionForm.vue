<!-- Form for creating freets -->
<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'SuggestionForm',
  mixins: [BlockForm],
  props: {
    _id: {
        type: [String],
        default: 'none',
    }
  },
  data() {
    /**
     * Options for submitting this form.
     */
    return {
      url: `/api/suggestions/${this._id}`,
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'intent', label: 'Alternative Intent', value: '', defaultVal: '', options: ['Share', 'Joke', 'Inform']},
        {id: 'supplement', label: 'Alternative Supplemental Link', value: '', defaultVal: ''},
        {id: 'tag', label: 'Additional Tags', value: '', defaultVal: ''},
      ],
      title: 'Make a suggestion',
      refreshFreets: true,
      alerts: {}, // Displays success/error messages encountered during form submission
      callback: () => {
        console.log("called")
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
      
      for (let field of this.fields){
        if (field.value !== '') {
          const options = {
            method: this.method,
            headers: {'Content-Type': 'application/json'},
            credentials: 'same-origin' // Sends express-session credentials with request
          };
          for (let item of field.value.split(",")){
            options.body = JSON.stringify({
              suggestionType: field.id.charAt(0).toUpperCase() + field.id.slice(1),
              suggestion: field.value,
            })
            try {
              var r = await fetch(this.url, options);
              if (!r.ok) {
                // If response is not okay, we throw an error and enter the catch block
                const res = await r.json();
                throw new Error(res.error);
              }
      
              if (this.callback) {
                console.log("callback")
                this.callback();
              }
            } catch (e) {
              this.$set(this.alerts, e, 'error');
              setTimeout(() => this.$delete(this.alerts, e), 3000);
              return;
            }
          }
        }
      }

      if (this.refreshFreets) {
        this.$store.commit('refreshFreets');
      }

      // close modal window
      this.$emit('onSubmit')
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