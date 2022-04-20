<template>
    <div>
        <el-tabs type="card" v-model="activeName">
            <el-tab-pane
                v-for="component of avaliableComponents"
                :key="'ActivityTab' + component.name"
                :label="component.label"
                lazy
                :name="component.name"
            >
                <component
                    v-if="activeName === component.name"
                    :is="component.name"
                    :activity-id="activityID"
                />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import checkPermission from "@/utils/permission" // 权限判断函数
import myWork from "./components/my-work"
import othersWorks from "./components/others-works.vue"
import allWorks from "./components/all-works.vue"
import { mapGetters } from "vuex"
export default {
    props: ["type", "activityId", "activity"],
    provide() {
        return {
            dimensions: this.activity.options.dimensions,
        }
    },
    components: { myWork, othersWorks, allWorks },
    data() {
        let activeName
        if (this.checkPermission(["student"])) {
            activeName = "myWork"
        } else {
            activeName = "allWorks"
        }

        return {
            activityID: "",
            activeName,
            avaliableComponents: [],
            components: [
                { name: "myWork", label: "我的作品", role: ["student"] },
                { name: "othersWorks", label: "同学作品", role: ["student"] },
                { name: "allWorks", label: "所有作品", role: ["teacher"] },
            ],
        }
    },
    created() {
        this.activityID = this.activityId
        // init the default selected tab
        const tab = this.$route.query.tab
        if (tab) {
            this.activeName = tab
        }
        let role = this.roles[0]
        this.avaliableComponents = this.components.filter(e => e.role.includes(role))
    },
    computed: {
        ...mapGetters(["roles"]),
    },
    watch: {
        activeName(val) {
            if (
                val &&
                this.avaliableComponents.some(e => {
                    return e.name === val
                })
            ) {
                this.$router.push(`${this.$route.path}?tab=${val}`)
            } else {
                this.activeName = this.checkPermission(["student"]) ? "myWork" : "allWorks"
            }
        },
        "$route.query.tab"(val) {
            if (
                val &&
                this.avaliableComponents.some(e => {
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

<style>
</style>
