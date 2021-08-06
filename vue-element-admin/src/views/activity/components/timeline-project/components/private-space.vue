<template>
    <div v-loading="loading">
        <div class="container">
            <!--无组时进入小组活动-->
            <div v-if="status === 'NotInclude'">
                <el-result title="出现了错误" :subTitle="errSubtitle">
                    <template slot="icon"><span style="font-size: 54px">😢</span></template>
                </el-result>
            </div>

            <!--无项目-->
            <div v-if="status === 'NoProject'">
                <el-empty description="暂时没有任何进度">
                    <el-button type="primary" @click="handleCreateProject">建立项目</el-button>
                </el-empty>
            </div>

            <!--新建项目-->
            <!--TODO: 加入创建project的form-->
            <div v-if="status === 'CreateProject'"></div>

            <!--正常显示项目-->
            <!--TODO: 时间线的显示与添加-->
            <div v-if="status === 'Normal'"></div>
        </div>
    </div>
</template>

<script>
import { getPrivateTimeline } from "@/api/activity"
export default {
    props: ["activityId"],
    data() {
        return {
            activityID: "",
            loading: false,
            status: "",
            errSubtitle: "",
            project: {},
        }
    },
    created() {
        this.activityID = this.activityId
        this.getPrivateTimeline()
    },
    methods: {
        getPrivateTimeline() {
            this.loading = true
            let activityID = this.activityID
            getPrivateTimeline({ activityID })
                .then(res => {
                    this.loading = false
                    let { project } = res.data
                    if (!project) {
                        this.status = "NoProject"
                    } else {
                        this.project = project
                        this.status = "Normal"
                    }
                })
                .catch(err => {
                    this.status = "NotInclude"
                    this.errSubtitle = err
                    this.loading = false
                })
        },
        handleCreateProject() {
            this.status = "CreateProject"
        },
    },
}
</script>

<style lang='scss' scoped>
.container {
    min-height: 40vh;
    padding-top: 20px;
}
</style>
