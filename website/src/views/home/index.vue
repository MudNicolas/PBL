<template>
  <div class="dashboard-container">
    <component :is="currentRole" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AdminHome from './admin'
import DefaultHome from './default'

export default {
    name: 'Home',
    components: { AdminHome, DefaultHome },
    data() {
        return {
            currentRole: ''
        }
    },
    computed: {
        ...mapGetters(['roles'])
    },
    created() {
        // console.log(this.roles);
        if (this.roles.includes('admin') || this.roles.includes('root')) {
            this.currentRole = 'AdminHome'
        } else {
            this.currentRole = 'DefaultHome'
        }
    }
}
</script>
