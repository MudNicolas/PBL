<template>
    <div class="view-wrapper">
        <froalaView v-model="content"></froalaView>
    </div>
</template>

<script>
import "froala-editor/css/froala_style.min.css"

export default {
    props: ["content"],
}
</script>

<style>
.view-wrapper {
    /*  border: 1px solid #dcdfe6;
    border-radius: 10px; */
    border-left: 1px solid #dcdfe6;
    font-family: sans-serif;
    color: #414141;
    font-size: 14px;
    line-height: 1.6;
    padding: 20px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow-x: auto;
    min-height: 60px;
    text-align: left;
    background: transparent;
    position: relative;
    z-index: 2;
    -webkit-user-select: auto;
    user-select: auto;
}
</style>
