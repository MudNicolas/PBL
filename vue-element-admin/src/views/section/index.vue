<template>
    <div class="container">
        <el-tabs type="border-card" v-model="activeName">
            <el-tab-pane
                v-for="component of components"
                :key="'CourseManageTab' + component.name"
                :label="component.label"
                lazy
                :name="component.name"
            >
                <component
                    v-if="activeName === component.name"
                    :is="component.name"
                    :section-id="sectionID"
                />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import SectionContent from "./components/section.vue"
import SectionSetting from "./components/setting.vue"
export default {
    name: "SectionView",
    components: { SectionContent, SectionSetting },
    data() {
        return {
            sectionID: "",
            activeName: "SectionContent",
            components: [
                { name: "SectionContent", label: "详情" },
                { name: "SectionSetting", label: "设置" },
            ],
        }
    },
    created() {
        this.sectionID = this.$route.params.id
        // init the default selected tab
        const tab = this.$route.query.tab
        if (tab) {
            this.activeName = tab
        }
    },
    watch: {
        activeName(val) {
            this.$router.push(`${this.$route.path}?tab=${val}`)
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
}
</script>

<style lang='scss' scoped>
.container {
    padding: 20px;
}
</style>
