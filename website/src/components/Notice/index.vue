<template>
    <div>
        <el-dropdown placement="bottom" size="medium" :hide-on-click="hideOnClick">
            <span class="el-dropdown-link out-area" @click="badgeClick">
                <el-badge is-dot class="item" :hidden="hidden">
                    <svg-icon icon-class="email" />
                </el-badge>
            </span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item icon="el-icon-message">通知</el-dropdown-item>
                <el-dropdown-item icon="el-icon-bell">我的私信</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
    </div>
</template>

<script>
export default {
    name: "Notice",
    data() {
        return {
            hidden: false,
            hideOnClick: false,
        }
    },

    methods: {
        badgeClick() {
            this.hidden = true
        },
    },
}
</script>

<style lang="scss" scoped>
.item {
    line-height: 0px;
}

.el-dropdown {
    font-size: 18px;
}

.out-area {
    display: inline-block;
}
</style>


