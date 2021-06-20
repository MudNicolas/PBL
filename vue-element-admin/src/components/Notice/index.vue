<template>
    <div>
        <el-dropdown
            placement="bottom"
            size="medium"
            :hide-on-click="hideOnClick"
        >
            <span class="el-dropdown-link out-area" @click="badgeClick">
                <el-badge is-dot class="item" :hidden="hidden">
                    <svg-icon icon-class="email" />
                </el-badge>
            </span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item icon="el-icon-plus"
                    >黄金黄金黄金黄金黄金糕</el-dropdown-item
                >
                <el-dropdown-item icon="el-icon-circle-plus"
                    >狮子头</el-dropdown-item
                >
                <el-dropdown-item icon="el-icon-circle-plus-outline"
                    >螺蛳粉</el-dropdown-item
                >
                <el-dropdown-item icon="el-icon-check">双皮奶</el-dropdown-item>
                <el-dropdown-item icon="el-icon-circle-check"
                    >蚵仔煎</el-dropdown-item
                >
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
        };
    },

    methods: {
        badgeClick() {
            this.hidden = true;
        },
    },
};
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


