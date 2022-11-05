<!-- 
<template>
  <main>
    <section v-if="$store.state.username">
      <header>
        <h2>Welcome @{{ $store.state.username }}</h2>
      </header>
      <CreateFilterForm />
      <section>
        <header>
          <div class="left">
            <h2>
              Viewing all filters
              <span v-if="$store.state.filter">
                by @{{ $store.state.filter }}
              </span>
            </h2>
          </div>
          <div class="right">
          </div>
        </header>
        <section
          v-if="$store.state.filters.length"
        >
          <FilterComponent
            v-for="filter in $store.state.filters"
            :key="filter.id"
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
</style> -->
