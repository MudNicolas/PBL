<template>
    <el-breadcrumb class="app-breadcrumb" separator="/">
        <transition-group name="breadcrumb">
            <el-breadcrumb-item v-for="(item, index) in levelList" :key="JSON.stringify(item)">
                <span
                    v-if="item.redirect === 'noRedirect' || index == levelList.length - 1"
                    class="no-redirect"
                >
                    {{ item.meta.title }}
                </span>
                <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
            </el-breadcrumb-item>
        </transition-group>
    </el-breadcrumb>
</template>

<script>
import { getBreadCrumb } from "@/api/bread-crumb"

export default {
    data() {
        return {
            levelList: null,
        }
    },
    watch: {
        "$route.path"(route) {
            // if you go to the redirect page, do not update the breadcrumbs
            if (route.startsWith("/redirect/")) {
                return
            }
            this.getBreadcrumb()
        },
    },
    created() {
        this.getBreadcrumb()
    },
    methods: {
        getBreadcrumb() {
            // only show routes with meta.title

            //let matched = this.$route.matched.map(e => e.path)
            let params = this.$route.params
            let name = this.$route.name

            getBreadCrumb({
                _id: params.id,
                name: name,
            }).then(res => {
                this.levelList = res.data.breadCrumb
            })
        },
        isHome(route) {
            const name = route && route.name
            if (!name) {
                return false
            }
            return name.trim().toLocaleLowerCase() === "Home".toLocaleLowerCase()
        },

        handleLink(item) {
            const { redirect, path } = item
            if (redirect) {
                this.$router.push(redirect)
                return
            }
            this.$router.push(path)
        },
    },
}
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
    display: inline-block;
    font-size: 14px;
    line-height: 50px;
    margin-left: 8px;

    .no-redirect {
        color: #97a8be;
        cursor: text;
    }
}
</style>
