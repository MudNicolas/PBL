<template>
    <div>
        <div v-for="comment of comments">
            {{ comment.comment }}
        </div>
    </div>
</template>

<script>
export default {
    name: "Comment",
    props: {
        comments: {
            type: Array,
            default: [],
        },
    },
}
</script>

<style>
</style>
