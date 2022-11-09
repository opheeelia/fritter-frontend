<!-- Form for creating filters -->

<template>
  <form @submit.prevent="submit">
    <h3>Create a filter</h3>
    <div
      v-for="field in fields"
      :key="field.id"
    >
      <label :for="field.id">{{ field.label }}:</label>
      <input
        v-if="field.id === 'name'"
        :name="field.id"
        :value="field.value"
        @input="field.value = $event.target.value"
        />
        <div
        v-else-if="field.id === 'public'"
        >
        {{field.value}}
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
          :value="field.text"
          @keyup.enter="search(field.id)"
          @input="field.text = $event.target.value"
        />
        <article class="user" v-for="user in searchedUsers">
          <header>
            <h3 class="name">
              {{ user.username }}
            </h3>
            <div class="actions">
              <button type="button" @click="addUser(user)">
                + Add
              </button>
            </div>
          </header>
        </article>
        <h3> Selected Users</h3>
        <article class="user" v-for="user in selectedUsers">
          <header>
            <h3 class="name">
              {{ user.username }}
            </h3>
            <div class="actions">
              <button type="button" @click="removeUser(user)">
                🗑️ Remove
              </button>
            </div>
          </header>
        </article>
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
</template>

<script>
import Vue from 'vue';
// import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'CreateFilterForm',
  // mixins: [BlockForm],
  data() {
    /**
     * Options for submitting this form.
     */
    return {
      url: '/api/filters',
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'name', label: 'Filter Name', value: '', defaultVal: ''},
        {id: 'public', label: 'Public', value: true, defaultVal: true},
        {id: 'users', label: 'Users', value: '', text: '', defaultVal: '', url: '/api/users?prefix='},
        {id: 'intent', label: 'Intents', value: [], defaultVal: [], options: ['Share', 'Joke', 'Inform'], multiple: true},
        {id: 'tagLabels', label: 'Tags', value: '', defaultVal: ''},
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
    async search(id){
      for (let field of this.fields) {
        if (field.id == id) {
          // submit 
          try {
            const r = await fetch(field.url + `${field.text}`);
            console.log(r);
            const res = await r.json();
            if (!r.ok) {
              throw new Error(res.error);
            } 
            for (let user of res.users){
              Vue.set(this.searchedUsers, user._id, user);
            }
          } catch (e) {
            this.$set(this.alerts, e, 'error');
            setTimeout(() => this.$delete(this.alerts, e), 3000);
          }
          field.text = field.defaultVal;
        }
      }
    },
    removeUser(user){
      Vue.delete(this.selectedUsers, user._id);
      Vue.set(this.searchedUsers, user._id, user);
    },
    addUser(user){
      Vue.delete(this.searchedUsers, user._id);
      Vue.set(this.selectedUsers, user._id, user);
    },
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
            include[1] = value.split(",");
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
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
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
</style>