<template>
    <div></div>
</template>

<script>
export default {
    name: "SectionView",
    created() {
        this.sectionID = this.$route.params.id
    },
    data() {
        return {
            sectionID: "",
        }
    },
}
</script>

<style>
</style>
