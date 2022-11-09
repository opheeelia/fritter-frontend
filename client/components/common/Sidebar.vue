
<template>
  <div id="sidebar">
    <div>
      <router-link
        v-if="$store.state.username"
        to="/filters"
      >
        Filters
      </router-link>
      <button
        v-if="$store.state.customFilters"
        v-for="filter in $store.state.customFilters"
        :key="filter.name"
        class="custom-filter"
        @click="applyFilter(filter)"
      >
        {{filter.name}}
      </button>
    </div>
    <section class="alerts">
      <article
        v-for="(status, alert, index) in $store.state.alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  methods: {
    applyFilter(filter){
      try {
        this.$store.commit('updateFilter', {type:'filter', value: filter._id, name: filter.name});
        this.$store.commit('refreshFreets');
        if (this.$route.name != 'Home'){
          this.$router.push({name: 'Home'}); // Goes to Home page after applying filter
        }
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
}
</script>

<style scoped>
#sidebar {
    padding: 1vw 2vw;
    background-color: #ccc;
    display: flex;
    height: 100vh;
    min-width: 10em;
    float: left;
    position: -webkit-sticky; /* Safari */
    position: sticky;
    top: 0;
    justify-content: flex-start;
    align-items: flex-start;
}

.custom-filter {
  display: block;
  margin: 0.5em 1em;
}

.title {
    font-size: 32px;
    margin: 0 5px;
}

img {
    height: 32px;
}

.left {
	display: flex;
	align-items: center;
}

.right {
    font-size: 20px;
    display: inline;
    gap: 16px;
    grid-auto-flow: column;
    align-items: center;
}

.right a {
    margin-left: 5px;
}

.alerts {
    width: 25%;
}
</style>
