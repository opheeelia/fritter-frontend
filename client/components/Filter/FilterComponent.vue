Reusable component representing a single filter and its actions
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="filter"
  >
    <header>
      <h3 class="author">
        @{{ filter.author }}
      </h3>
      <div
        class="actions"
      >
        <button @click="deleteFilter">
          🗑️ Delete
        </button>
      </div>
      <div class="info">
        <div>Intent: {{filter.intent.intent}}</div>
        <div>Suggestions: {{tagSugs}}</div>
        <div>Suggestions: {{intentSugs}}</div>
        <div>Suggestions: {{supplementSugs}}</div>
      </div>
    </header>
    <p
      class="content"
    >
      {{ filter.content }}
    </p>
    <p class="info">
      Posted at {{ filter.dateModified }}
      <i v-if="filter.edited">(edited)</i>
    </p>
    <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
  </article>
</template>

<script>
import ModalWindow from '@/components/common/ModalWindow.vue';
import SuggestionForm from '@/components/Suggestions/SuggestionForm.vue';


export default {
  name: 'FilterComponent',
  components: {ModalWindow, SuggestionForm},
  props: {
    // Data from the stored filter
    filter: {
      type: Object,
      required: true
    }
  },
  data() {
    const tag_sugs = [];
    const intent_sugs = [];
    const supplement_sugs = [];
    for (let sug of this.filter.suggestions) {
      const content = sug._id.suggestion;
      if (sug._id.suggestionType == "Tag"){
        tag_sugs.push(content);
      } else if (sug._id.suggestionType == "Intent") {
        intent_sugs.push(content);
      } else if (sug._id.suggestionType == "Supplement") {
        supplement_sugs.push(content);
      }
    }
    return {
      editing: false, // Whether or not this filter is in edit mode
      draft: this.filter.content, // Potentially-new content for this filter
      alerts: {}, // Displays success/error messages encountered during filter modification
      SuggestionForm: SuggestionForm,
      tagSugs: tag_sugs,
      intentSugs: intent_sugs,
      supplementSugs: supplement_sugs
    };
  },
  methods: {
    startEditing() {
      /**
       * Enables edit mode on this filter.
       */
      this.editing = true; // Keeps track of if a filter is being edited
      this.draft = this.filter.content; // The content of our current "draft" while being edited
    },
    stopEditing() {
      /**
       * Disables edit mode on this filter.
       */
      this.editing = false;
      this.draft = this.filter.content;
    },
    async deleteFilter() {
      /**
       * Deletes this filter.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted filter!', status: 'success'
          });
        }
      };
      // delete associated intention
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      try {
        const r = await fetch(`/api/intent/${this.filter._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
      this.request(params);
    },
    submitEdit() {
      /**
       * Updates filter to have the submitted draft content.
       */
      if (this.filter.content === this.draft) {
        const error = 'Error: Edited filter content should be different than current filter content.';
        this.$set(this.alerts, error, 'error'); // Set an alert to be the error text, timeout of 3000 ms
        setTimeout(() => this.$delete(this.alerts, error), 3000);
        return;
      }

      const params = {
        method: 'PATCH',
        message: 'Successfully edited filter!',
        body: JSON.stringify({content: this.draft}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.request(params);
    },
    async request(params) {
      /**
       * Submits a request to the filter's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }

      try {
        const r = await fetch(`/api/filters/${this.filter._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.$store.commit('refreshFilters');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>

<style scoped>
.filter {
    border: 1px solid #111;
    padding: 20px;
    position: relative;
}
</style>
