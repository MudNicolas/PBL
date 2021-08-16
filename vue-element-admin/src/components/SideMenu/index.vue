<template>
    <ul class="side-menu">
        <slot></slot>
    </ul>
</template>

<script>
export default {
    name: "SideMenu",
}
</script>

<style lang='scss' scoped>
.side-menu {
    border: 1px solid #dcdfe6;
    width: 100%;
    list-style: none;
    line-height: 36px;
    padding: 0;
    margin: 0;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    outline: 0;
    border-radius: 6px;
    li {
        padding: 0 20px;
        background-color: rgb(250, 251, 252);
    }
    li:hover {
        background-color: rgb(246, 248, 250);
    }
    li.active {
        background-color: #ffffff;
        border-left: 2px solid rgb(249, 130, 108);
    }

    li:not(:first-child) {
        border-top: 1px solid #e1e4e8;
    }
}
</style>
