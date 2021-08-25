<template>
    <div v-loading="loading">
        <div class="container">
            <!--无组时进入小组活动-->
            <div v-if="status === 'Error'">
                <el-result title="出现了错误" :subTitle="errSubtitle">
                    <template slot="icon"><span style="font-size: 54px">😢</span></template>
                </el-result>
            </div>

            <!--无项目-->
            <div v-if="status === 'NoProject'">
                <el-empty description="暂时没有任何进度"></el-empty>
            </div>

            <!--正常显示项目-->
            <div v-if="status === 'Normal'">
                <workspace :project="project" :stages="stages" :private="false" />
            </div>
        </div>
    </div>
</template>

<script>
import { getPrivateTimeline } from "@/api/activityManage"
import workspace from "../components/workspace.vue"

export default {
    components: { workspace },
    data() {
        return {
            projectID: this.$route.params.id,
            loading: false,
            status: "",
            errSubtitle: "",
            project: {},
            stages: [],
        }
    },
    created() {
        this.getPrivateTimeline()
    },
    methods: {
        getPrivateTimeline() {
            this.loading = true
            let { projectID } = this
            getPrivateTimeline({ projectID })
                .then(res => {
                    this.loading = false
                    let { status } = res.data
                    if (status === "NoProject") {
                        this.status = "NoProject"
                    } else {
                        let { project, stages } = res.data
                        this.project = project
                        this.stages = stages
                        this.status = "Normal"
                    }
                })
                .catch(err => {
                    this.status = "Error"
                    this.errSubtitle = "Error: " + err.message
                    this.loading = false
                })
        },
    },
}
</script>

<style lang='scss' scoped>
.container {
    min-height: 40vh;
    padding: 30px;
}
</style>
