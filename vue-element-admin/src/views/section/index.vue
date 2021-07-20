<template>
    <div class="container">
        <el-tabs type="card" v-model="activeName">
            <el-tab-pane label="详情" name="SectionContent">
                <span slot="label">
                    <i class="el-icon-tickets"></i>
                    详情
                </span>
                <section-content v-if="activeName === 'SectionContent'" :section-id="sectionID" />
            </el-tab-pane>
            <el-tab-pane v-if="checkPermission(['teacher'])" label="设置" name="SectionSetting">
                <span slot="label">
                    <i class="el-icon-setting"></i>
                    管理
                </span>
                <section-setting v-if="activeName === 'SectionSetting'" :section-id="sectionID" />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import SectionContent from "./components/section.vue"
import SectionSetting from "./components/setting.vue"
import checkPermission from "@/utils/permission" // 权限判断函数

export default {
    name: "SectionView",
    components: { SectionContent, SectionSetting },
    created() {
        this.sectionID = this.$route.params.id
        // init the default selected tab
        const tab = this.$route.query.tab
        if (tab) {
            this.activeName = tab
        }
    },
    data() {
        return {
            sectionID: "",
            activeName: "SectionContent",
            components: [
                { name: "SectionContent", label: "详情" },
                { name: "SectionSetting", label: "管理" },
            ],
        }
    },

    watch: {
        activeName(val) {
            if (
                val &&
                this.components.some(e => {
                    return e.name === val
                })
            ) {
                this.$router.push(`${this.$route.path}?tab=${val}`)
            } else {
                this.activeName = "SectionContent"
            }
        },
        "$route.query.tab"(val) {
            if (
                val &&
                this.components.some(e => {
                    return e.name === val
                })
            ) {
                this.activeName = val
            }
        },
    },
    methods: {
        checkPermission,
    },
}
</script>

<style lang='scss' scoped>
.container {
    padding: 20px;
}
</style>
