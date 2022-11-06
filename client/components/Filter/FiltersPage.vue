<template>
  <main>
    <section v-if="$store.state.username">
      <CreateFilterForm />
      <header>
        <h2>Your filters</h2>
      </header>
      <section>
        <section
          v-if="$store.state.customFilters.length"
        >
          <FilterComponent
            v-for="filter in $store.state.customFilters"
            :key="filter._id"
            :filter="filter"
          />
        </section>
        <article
          v-else
        >
          <h3>No filters found.</h3>
        </article>
      </section>
    </section>
    <section v-else>
      <header>
        <h2>Welcome to Fritter!</h2>
      </header>
      <article>
        <h3>
          <router-link to="/login">
            Sign in
          </router-link>
          to view this page.
        </h3>
      </article>
    </section>
  </main>
</template>

<script>
import FilterComponent from '@/components/Filter/FilterComponent.vue';
import CreateFilterForm from '@/components/Filter/CreateFilterForm.vue';
// import GetFiltersForm from '@/components/Filter/GetFiltersForm.vue';

export default {
  name: 'FiltersPage',
  components: {FilterComponent, CreateFilterForm},
  // mounted() {
  //   this.$refs.getFiltersForm.submit();
  // }
};
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
}

header, header > * {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

button {
    margin-right: 10px;
}

section .scrollbox {
  flex: 1 0 50vh;
  padding: 3%;
  overflow-y: scroll;
}
</style>
