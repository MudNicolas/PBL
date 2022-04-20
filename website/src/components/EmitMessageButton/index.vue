<template>
    <!-- <el-button
        @click="handleMessage(uid)"
        :size="size"
        style="margin-top: 4px"
        icon="el-icon-message"
        >发送私信</el-button
    > -->
</template>

<script>
export default {
    name: "EmitMessageButton",
    props: {
        uid: String,
        size: {
            default: "mini",
        },
    },

    methods: {
        handleMessage(uid) {
            console.log(uid)
        },
    },
}
</script>

<style>
</style>
