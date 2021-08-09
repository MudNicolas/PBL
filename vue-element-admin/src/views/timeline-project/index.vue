<template>
    <div>{{ stageID }}</div>
</template>

<script>
export default {
    name: "TimeLineStage",
    data() {
        return {
            projectID: this.$route.query.projectID,
            stageID: this.$route.query.id,
        }
    },
    created() {
        this.getStage()
    },
    methods: {
        getStage() {},
    },
}
</script>

<style>
</style>
