
<template>
  <div id="sidebar">
    <div class="right">
      <router-link
        v-if="$store.state.username"
        to="/filters"
      >
        Filters
      </router-link>
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
    display: grid;
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
