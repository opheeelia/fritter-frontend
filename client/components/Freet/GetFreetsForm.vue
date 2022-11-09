<!-- Form for getting freets (all, from user) (inline style) -->

<script>
import InlineForm from '@/components/common/InlineForm.vue';

export default {
  name: 'GetFreetsForm',
  mixins: [InlineForm],
  data() {
    return {value: this.$store.state.filter.type === "username" ? this.$store.state.filter.value : ''};
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
