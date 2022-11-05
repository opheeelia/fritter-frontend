<!-- Form for getting freets (all, from user) (inline style) -->

<script>
import InlineForm from '@/components/common/InlineForm.vue';

export default {
  name: 'GetFreetsForm',
  mixins: [InlineForm],
  data() {
    return {value: this.$store.state.filter.value};
  },
  methods: {
    async submit() {
      const url = this.value ? `/api/freets?author=${this.value}` : '/api/freets';
      try {
        if (this.value) {
          this.$store.commit('updateFilter', {type: "username", value: this.value});
        } else {
          this.$store.commit('updateFilter', {type: "", value: null});
        }
        this.$store.commit('refreshFreets');
        // const r = await fetch(url);
        // const res = await r.json();
        // if (!r.ok) {
        //   throw new Error(res.error);
        // }

        // for (let i in res){
        //   const r_intent = await fetch(`/api/intent/${res[i]._id}`);
        //   const res_intent = await r_intent.json();
        //   if (!r_intent.ok) {
        //     throw new Error(res_intent.error);
        //   }
        //   res[i].intent = res_intent;
        //   const r_suggestions = await fetch(`api/suggestions/${res[i]._id}`);
        //   const res_suggestions = await r_suggestions.json();
        //   // console.log(res_suggestions.suggestions);
        //   if (!r_suggestions.ok){
        //     throw new Error(res_intent.error);
        //   }
        //   res[i].suggestions = res_suggestions.suggestions;
        // }

        // this.$store.commit('updateFilter', {type: "username", value: this.value});
        // // console.log((res[0].authorId));
        // this.$store.commit('updateFreets', res);
      } catch (e) {
        if ( this.$store.state.filter && this.value === this.$store.state.filter.value) {
          // This section triggers if you filter to a user but they
          // change their username when you refresh
          this.$store.commit('updateFilter', {type: "", value: null});
          this.value = ''; // Clear filter to show all users' freets
          this.$store.commit('refreshFreets');
        } else {
          // Otherwise reset to previous fitler
          this.value = this.$store.state.filter.value;
        }

        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>
