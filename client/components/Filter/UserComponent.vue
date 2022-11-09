
<template>
  <article
    class="user"
  >
    <header>
      <h3 class="name">
        {{ user.name }}
      </h3>
      <div class="actions">
        <button @click="deleteuser">
          🗑️ Delete
        </button>
      </div>
    </header>
    <p class="info">
      {{ user.include }}
    </p>
    <p class="info">
      {{ user.public ? "Public" : "Private" }}
    </p>
    <p class="info">
      Created at {{ user.dateCreated }}
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

export default {
  name: 'userComponent',
  components: {},
  props: {
    // Data from the stored user
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      alerts: {}, // Displays success/error messages encountered during user modification
    };
  }
};
</script>

<style scoped>
.user {
    border: 1px solid #111;
    padding: 20px;
    position: relative;
}
</style>
