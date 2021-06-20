<template>
    <div class="dashboard-container">
        <component :is="currentRole" />
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import adminHome from "./admin";
import DefaultHome from "./default";

export default {
    name: "Home",
    components: { adminHome, DefaultHome },
    data() {
        return {
            currentRole: "",
        };
    },
    computed: {
        ...mapGetters(["roles"]),
    },
    created() {
        //console.log(this.roles);
        if (this.roles.includes("admin")) {
            this.currentRole = "adminHome";
        } else {
            this.currentRole = "DefaultHome";
        }
    },
};
</script>
