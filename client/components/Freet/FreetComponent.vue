<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet"
  >
    <header>
      <h3 class="author">
        @{{ freet.author }}
      </h3>
      <div class="info">
        <p>
          Posted at {{ freet.dateModified }}
          <i v-if="freet.edited">(edited)</i>
        </p>
        <div class="trait">Intent: {{freet.intent[0].intent}}</div>
        <div class="trait" v-if="tagLabels.length > 0">Tags:
          <span v-for="tag in tagLabels">{{tag}}, </span>
        </div>
        <div class="trait" v-if="freet.intent[0].intent === 'Inform'">Supplement: <a :href=freet.intent[0].supplement>{{freet.intent[0].supplement}}</a></div>
        <div class="trait suggested" v-if="intentSugs.length > 0">Suggested intents:
           <span v-for="intent in intentSugs">{{intent}}, </span>
        </div>
        <div class="trait suggested" v-if="supplementSugs.length > 0">Suggested supplements:
          <span v-for="sup in supplementSugs">
            <a :href=sup>{{sup}}</a>, 
          </span>
        </div>
        <div class="trait suggested" v-if="tagSugs.length > 0">Suggested tags:
          <span v-for="tag in tagSugs">{{tag}}, </span>
        </div>
      </div>
    </header>
    <textarea
      v-if="editing"
      class="content"
      :value="draft"
      @input="draft = $event.target.value"
    />
    <p
      v-else
      class="content"
    >
      {{ freet.content }}
    </p>
    <div
        v-if="$store.state.username === freet.author"
        class="actions"
      >
        <button
          v-if="editing"
          @click="submitEdit"
        >
          ✅ Save changes
        </button>
        <button
          v-if="editing"
          @click="stopEditing"
        >
          🚫 Discard changes
        </button>
        <button
          v-if="!editing"
          @click="startEditing"
        >
          ✏️ Edit
        </button>
        <button @click="deleteFreet">
          🗑️ Delete
        </button>
      </div>
      <div 
        v-else
        class="actions"
      >
        <ModalWindow
          :title="'Make a suggestion'"
          :body="SuggestionForm"
          :footer="''"
          :bodyProps="freet"
        />
      </div>
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
  name: 'FreetComponent',
  components: {ModalWindow, SuggestionForm},
  props: {
    // Data from the stored freet
    freet: {
      type: Object,
      required: true
    }
  },
  data() {
    const tag_sugs = [];
    const intent_sugs = [];
    const supplement_sugs = [];
    for (let sug of this.freet.suggestions) {
      const content = sug.suggestion;
      if (sug.suggestionType == "Tag"){
        tag_sugs.push(content);
      } else if (sug.suggestionType == "Intent") {
        intent_sugs.push(content);
      } else if (sug.suggestionType == "Supplement") {
        supplement_sugs.push(content);
      }
    }
    const tagLabels = this.freet.tags.map((tag) => tag.tagLabel);
    return {
      editing: false, // Whether or not this freet is in edit mode
      draft: this.freet.content, // Potentially-new content for this freet
      alerts: {}, // Displays success/error messages encountered during freet modification
      SuggestionForm: SuggestionForm,
      tagSugs: tag_sugs,
      intentSugs: intent_sugs,
      supplementSugs: supplement_sugs,
      tagLabels: tagLabels,
    };
  },
  methods: {
    startEditing() {
      /**
       * Enables edit mode on this freet.
       */
      this.editing = true; // Keeps track of if a freet is being edited
      this.draft = this.freet.content; // The content of our current "draft" while being edited
    },
    stopEditing() {
      /**
       * Disables edit mode on this freet.
       */
      this.editing = false;
      this.draft = this.freet.content;
    },
    async deleteFreet() {
      /**
       * Deletes this freet.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted freet!', status: 'success'
          });
        }
      };
      // delete associated intention
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      try {
        const r = await fetch(`/api/intent/${this.freet._id}`, options);
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
       * Updates freet to have the submitted draft content.
       */
      if (this.freet.content === this.draft) {
        const error = 'Error: Edited freet content should be different than current freet content.';
        this.$set(this.alerts, error, 'error'); // Set an alert to be the error text, timeout of 3000 ms
        setTimeout(() => this.$delete(this.alerts, error), 3000);
        return;
      }

      const params = {
        method: 'PATCH',
        message: 'Successfully edited freet!',
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
       * Submits a request to the freet's endpoint
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
        const r = await fetch(`/api/freets/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.$store.commit('refreshFreets');

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
.freet {
    border: 1px solid #111;
    padding: 20px;
    position: relative;
    border-radius: 0.3em;
    margin: 2em 0em;
}

.info {
  font-size: 0.8em;
}

.trait{
  display: inline-block;
  font-size: 0.8em;
  margin: 0.5em;
  padding: 0.5em;
  border-style: solid;
  border-color: rgba(51, 51, 51, 0.05);
  border-radius: 0.5em;
  background-color: rgba(6, 7, 6, 0.15);
}

.suggested{
  background-color: #a6c6b1;
}
</style>
