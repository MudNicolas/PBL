<template>
    <div v-loading="loading">
        <div class="container" :class="{ 'teacher-padding': !roles.includes('student') }">
            <!--无组时进入小组活动-->
            <div v-if="status === 'Error'">
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
            <div
                v-if="status === 'CreateProject' && checkPermission(['student'])"
                style="padding-top: 8px"
            >
                <create-project :activity-id="activityId" @onSuccess="getPrivateTimeline" />
            </div>

            <!--正常显示项目-->
            <div v-if="status === 'Normal'">
                <workspace
                    :project="project"
                    :stages="stages"
                    @editIntroSuccess="handleEditIntroSuccess"
                    :private="true"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { getPrivateTimeline } from "@/api/activity"
import { teacherGetPrivateTimeline } from "@/api/activityManage"
import createProject from "./components/create-project.vue"
import workspace from "@/components/Workspace"
import { mapGetters } from "vuex"
import checkPermission from "@/utils/permission" // 权限判断函数

export default {
    props: ["activityId"],
    components: { createProject, workspace },
    data() {
        return {
            activityID: "",
            loading: false,
            status: "",
            errSubtitle: "",
            project: {},
            stages: [],
            projectID: this.$route.params.id,
        }
    },
    created() {
        this.activityID = this.activityId
        this.getPrivateTimeline()
    },
    computed: {
        ...mapGetters(["roles"]),
    },
    methods: {
        checkPermission,
        getPrivateTimeline() {
            this.loading = true
            let fn
            if (this.roles.includes("student")) {
                let activityID = this.activityID
                fn = getPrivateTimeline({ activityID })
            } else {
                let { projectID } = this
                fn = teacherGetPrivateTimeline({ projectID })
            }

            fn.then(res => {
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
            }).catch(err => {
                this.status = "Error"
                this.errSubtitle = "Error: " + err.message
                this.loading = false
            })
        },
        handleCreateProject() {
            this.status = "CreateProject"
        },
        handleEditIntroSuccess(project) {
            this.project.name = project.name
            this.project.intro = project.intro
        },
    },
}
</script>

<style lang='scss' scoped>
.container {
    min-height: 40vh;
    padding-top: 20px;
}

.teacher-padding {
    padding: 30px;
}
</style>
