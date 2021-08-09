<template>
    <div class="container" v-loading="loading" element-loading-text="加载中">
        <el-row>
            <el-col :span="16" :offset="4">
                <el-form>
                    <el-form-item>{{ stage.subjectName | subjectNameFilter }}</el-form-item>
                    <el-form-item>
                        <el-input v-model="stage.subjectName" placeholder="阶段名" />
                    </el-form-item>
                    <el-form-item>
                        <el-input
                            v-model="stage.sketch"
                            type="textarea"
                            :autosize="{ minRows: 2 }"
                            placeholder="摘要"
                        />
                    </el-form-item>
                    <el-form-item>
                        <!--frola-->
                        <editor :exist-content="stage.content" ref="editor" />
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { getStage } from "@/api/timeline-project"
import Editor from "@/components/Editor"
export default {
    name: "TimeLineStage",
    components: { Editor },
    filters: {
        subjectNameFilter: val => {
            return val || "暂无阶段名"
        },
        sketchFilter: val => {
            return val || "暂无简述"
        },
    },
    data() {
        return {
            stageID: this.$route.params.id,
            loading: false,
            stage: {},
        }
    },
    created() {
        this.getStage()
    },
    methods: {
        getStage() {
            let { stageID } = this
            this.loading = true
            getStage({ stageID })
                .then(res => {
                    this.stage = res.data
                    this.loading = false
                })
                .catch()
        },
        contentChange(val) {
            console.log(val)
            this.stage.content = val
        },
    },
}
</script>

<style lang="scss" scoped>
.container {
    min-height: 80vh;
    padding: 40px;
}
</style>
