<!-- Form for creating filters -->
<!-- 
<template>
  <form @submit.prevent="submit">
    <h3>Create a filter</h3>
    <div
      v-for="field in fields"
      :key="field.id"
    >
      <label :for="field.id">{{ field.label }}:</label>
      <div v-if="field.tooltip" class="tooltip">?
        <span class="tooltiptext">{{field.tooltip}}</span>
      </div>
      <input
        v-if="field.id === 'name'"
        :name="field.id"
        :value="field.value"
        @input="field.value = $event.target.value"
        />
        <div
        v-else-if="field.id === 'public'"
        >
        <label class="switch">
          <input
            type="checkbox"
            v-model="field.value"
            @change="field.value = $event.target.checked"
          >
          <span class="slider round"></span>
        </label>
      </div>
      <div v-else-if="field.id === 'users'">
        <textarea
          :name="field.id"
          :value="field.value"
          @keyup.enter="search(field.id)"
          @input="field.value = $event.target.value"
        />
        <div class="results">
          <article class="user" v-for="user in searchedUsers">
            <p class="name">
              {{ user.username }}
            </p>
            <div class="actions">
              <button type="button" @click="addUser(user)">
                + Add
              </button>
            </div>
          </article>
        </div>
        <h4> Selected Users:</h4>
        <div class="results">
          <p v-if="Object.keys(selectedUsers).length == 0">No users selected. Add a user by searching above.</p>
          <article 
            v-else
            class="user"
            v-for="user in selectedUsers"
          >
            <p class="name">
              {{ user.username }}
            </p>
            <div class="actions">
              <button type="button" @click="removeUser(user)">
                🗑️ Remove
              </button>
            </div>
          </article>
        </div>
      </div>
      <input
        v-else-if="field.id === 'tagLabels'"
        :name="field.id"
        :value="field.value"
        @input="field.value = $event.target.value"
      />
      <select
        v-else-if="field.id === 'intent' && field.multiple === true"
        :name="field.id"
        v-model="field.value"
        multiple
      >
        <option 
            v-for="option in field.options"
            :value="option"
        >
          {{option}}
        </option>
      </select>
    </div>
    <button
      type="submit"
    >
      {{ title }}
    </button>
    <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
  </form>
</template> -->

<script>
import Vue from 'vue';
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'CreateFilterForm',
  mixins: [BlockForm],
  data() {
    /**
     * Options for submitting this form.
     */
    return {
      url: '/api/filters',
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'name', label: 'Filter Name', value: '', defaultVal: '', required: true},
        {id: 'public', label: 'Public', value: true, defaultVal: true, required: true},
        {id: 'users', label: 'Search for users', value: '', defaultVal: '', url: '/api/users?prefix='},
        {id: 'intent', label: 'Intents', value: [], defaultVal: [], options: ['Share', 'Joke', 'Inform'], multiple: true},
        {id: 'tagLabels', label: 'Tags', value: '', defaultVal: '', tooltip: 'Tag your freet with some keyword(s), separated by a comma.'},
      ],
      searchedUsers: {},
      selectedUsers: {},
      title: 'Create a filter',
      setUsername: false, // Whether or not stored username should be updated after form submission
      alerts: {}, // Displays success/error messages encountered during form submission
      callback: () => {
        const message = 'Successfully created a filter!';
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  },
  methods: {
    // async search(id){
    //   for (let field of this.fields) {
    //     if (field.id == id) {
    //       // submit 
    //       try {
    //         const r = await fetch(field.url + `${field.value}`);
    //         const res = await r.json();
    //         if (!r.ok) {
    //           throw new Error(res.error);
    //         } 
    //         if (res.users.length == 0) {
    //           throw new Error('No users found');
    //         }
    //         for (let user of res.users){
    //           Vue.set(this.searchedUsers, user._id, user);
    //         }
    //       } catch (e) {
    //         this.$set(this.alerts, e, 'error');
    //         setTimeout(() => this.$delete(this.alerts, e), 3000);
    //       }
    //       field.value = field.defaultVal;
    //     }
    //   }
    // },
    // removeUser(user){
    //   Vue.delete(this.selectedUsers, user._id);
    //   Vue.set(this.searchedUsers, user._id, user);
    // },
    // addUser(user){
    //   Vue.delete(this.searchedUsers, user._id);
    //   Vue.set(this.selectedUsers, user._id, user);
    // },
    async submit() {
      /**
        * Submits a form with the specified options from data().
        */
      const options = {
        method: this.method,
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin' // Sends express-session credentials with request
      };
      if (this.hasBody) {
        const include = [[], [], []];
        const body = {};
        this.fields.forEach(field => {
          var {id, value} = field;
          if (id == "users") {
            include[0] = Object.keys(this.selectedUsers);
          } else if (id == "tagLabels") {
            include[1] = value ? value.split(",").map((x)=>x.replace(/\s/g, '')) : [];
          } else if (id == "intent") {
            include[2] = value
          } else if (id == "name" || id == "public"){
            body[id] = value;
          }
          field.value = field.defaultVal;
        })
        body.include = include;
        options.body = JSON.stringify(body);
      }
      try {
        var r = await fetch(this.url, options);
        if (!r.ok) {
          // If response is not okay, we throw an error and enter the catch block
          const res = await r.json();
          throw new Error(res.error);
        }

        this.$store.commit('refreshCustomFilters');

        if (this.callback) {
          this.callback();
        }
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
  }
};
</script>

<style scoped>
form {
  border: 1px solid #111;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 14px;
  position: relative;
  border-radius: 0.2em;
}

div {
  display: flex;
  flex-direction: column;
}

form p {
  margin: 0;
}

form h3,
form > * {
  margin: 0.3em 0;
}

form h3 {
  margin-top: 0;
}

textarea {
   font-family: inherit;
   font-size: inherit;
}

/* The switch - derived from https://www.w3schools.com/howto/howto_css_switch.asp */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #769c7b;
}

input:focus + .slider {
  box-shadow: 0 0 1px #769c7b;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Tooltip CSS from https://www.w3schools.com/css/css_tooltip.asp */
/* Tooltip container */
.tooltip {
  background-color: gray;
  color: white;
  width: 1em;
  text-align: center;
  border-radius: 2em;
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
 
  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>