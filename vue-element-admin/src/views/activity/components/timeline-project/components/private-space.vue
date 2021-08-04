<template>
    <div></div>
</template>

<script>
export default {
    props: ["activityId"],
    data() {
        return {
            activityID: "",
        }
    },
    created() {
        this.activityID = this.activityId
        this.getPrivateTimeline()
    },
    methods: {
        getPrivateTimeline() {},
    },
}
</script>

<style>
</style>
