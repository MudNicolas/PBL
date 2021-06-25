<template>
    <el-button
        @click="handleMessage(uid)"
        size="mini"
        style="margin-top: 4px; width: 100px"
        ><svg-icon icon-class="email" />&nbsp;发送私信</el-button
    >
</template>

<script>
export default {
    name: "EmitMessageButton",
    props: ["uid"],
    methods: {
        handleMessage(uid) {
            console.log(uid);
        },
    },
};
</script>

<style>
</style>
