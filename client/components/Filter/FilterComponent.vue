<!-- Reusable component representing a single filter and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="filter"
  >
    <header>
      <h3 class="name">
        {{ filter.name }}
      </h3>
    </header>
    <p class="info">
      Created at {{ filter.dateCreated }}
    </p>
    <p class="info">
      {{ filter.public ? "Public" : "Private" }}
    </p>
    <h4>Users included in filter:</h4>
    <div class="trait" v-if="filter.include[0].length > 0">
      <span v-for="tag in filter.include[0]">{{tag}}, </span>
    </div>
    <div v-else>None</div>
    <h4>Tags included in filter:</h4>
    <div class="trait" v-if="filter.include[1].length > 0">
      <span v-for="tag in filter.include[1]">{{tag}}, </span>
    </div>
    <div v-else>None</div>
    <h4>Intents included in filter:</h4>
    <div class="trait" v-if="filter.include[2].length > 0">
      <span v-for="tag in filter.include[2]">{{tag}}, </span>
    </div>
    <div v-else>None</div>
    <div class="actions">
      <button @click="deletefilter">
        🗑️ Delete
      </button>
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

export default {
  name: 'filterComponent',
  props: {
    // Data from the stored filter
    filter: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      alerts: {}, // Displays success/error messages encountered during filter modification
    };
  },
  methods: {
    async deletefilter() {
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
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      try {
        const r = await fetch(`/api/filters/${this.filter._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.$store.commit('refreshCustomFilters');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
  }
};
</script>

<style scoped>
.filter {
    border: 1px solid #111;
    padding: 1em;
    margin: 1em 0em;
    position: relative;
    border-radius: 0.3em;
    background-color: #769c7b;
}
.info {
  font-size: 0.8em;
}
</style>
