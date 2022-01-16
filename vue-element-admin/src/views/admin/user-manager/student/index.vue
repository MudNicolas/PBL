<template>
    <div class="container">
        <user-manager role="student" />
    </div>
</template>

<script>
import UserManager from "../components/UserManager.vue"
export default {
    name: "StudentManager",
    components: { UserManager },
}
</script>

<style lang="scss" scoped>
.container {
    padding: 40px;
    min-height: 80vh;
}
</style>
