<template>
    <div class="container" v-loading="loading">
        <workspace :project="project" :stages="stages" :private="false" />
    </div>
</template>


<script>
import workspace from "@/components/Workspace"
import { getPubicProject } from "@/api/timeline-project"

export default {
    name: "PublicTimelineProjectView",
    components: { workspace },

    data() {
        return {
            project: {},
            stages: [],
            loading: false,
            projectID: this.$route.params.id,
        }
    },
    created() {
        this.getPubicProject()
    },
    methods: {
        getPubicProject() {
            this.loading = true
            let { projectID } = this
            getPubicProject({ projectID })
                .then(res => {
                    this.loading = false
                    let { project, stages } = res.data
                    this.project = project
                    this.stages = stages
                })
                .catch(() => {})
        },
    },
}
</script>

<style lang='scss' scoped>
.container {
    min-height: 80vh;
    padding: 40px;
}
.clearfix {
    font-size: 20px;
    display: flex;
    align-items: center;
    color: #303133;
}
.intro {
    font-size: 14px;
    margin-bottom: 12px;
    color: #606266;

    .text {
        line-height: 1.5;
    }
}
.stage-wrapper {
    height: 86px;

    .create-stage-card-wrapper {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
.content-preview {
    color: #606266;
    //文本超出部分以...形式展示
    text-overflow: -o-ellipsis-lastline;
    //整体超出部分隐藏
    overflow: hidden;
    //文本超出部分以...形式展示，同第一行样式代码
    text-overflow: ellipsis;
    //display 块级元素展示
    display: -webkit-box;
    //设置文本行数为2行
    -webkit-line-clamp: 2;
    //设置文本行数为2行
    line-clamp: 2;
    //从上到下垂直排列子元素（设置伸缩盒子的子元素排列方式）
    -webkit-box-orient: vertical;
}

.subjuct-name {
    font-size: 16px;
    color: #303133;
    display: flex;
    align-items: center;
}

.stage-choice-card {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    transition: all 0.3s;

    i {
        font-size: 48px;
        margin-bottom: 8px;
        color: #606266;
        transition: all 0.3s;
    }

    .tip {
        color: #606266;
    }
}

.corner-mark {
    position: absolute;
    width: 0;
    height: 0;
    border-top: 20px solid #67c23a;
    border-right: 20px solid transparent;
}

.author-area {
    display: flex;
    margin-top: 12px;

    .author {
        margin-right: 6px;
    }
}

.stage-wrapper {
    height: 86px;

    .create-stage-card-wrapper {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
