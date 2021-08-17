<template>
    <div v-loading="loading">
        <el-row class="subtitle">
            <el-col :span="16" :offset="4">
                <div class="subject-name">
                    {{ stage.subjectName | subjectNameFilter }}
                    <!--TODO:管理页面-->

                    <el-button style="margin-left: auto" icon="el-icon-view" @click="toView">
                        详情
                    </el-button>
                </div>
                <div class="author-area">
                    <div v-for="user of stage.authorUID" :key="user._id">
                        <div class="author">
                            <el-popover
                                placement="left"
                                trigger="hover"
                                :open-delay="200"
                                width="360"
                                @show="showUpPopoverKey = user._id"
                            >
                                <div>
                                    <profile-popover
                                        :uid="user._id"
                                        :show-up-popover-key="showUpPopoverKey"
                                    />
                                </div>
                                <span slot="reference">
                                    <el-avatar
                                        :size="24"
                                        :src="avatarPath + user.avatar"
                                    ></el-avatar>
                                </span>
                            </el-popover>
                        </div>
                    </div>
                </div>
            </el-col>
        </el-row>
        <div class="container">
            <el-row>
                <el-col :span="16" :offset="4">
                    <el-form label-positoin="left" label-width="80px">
                        <el-form-item label="阶段名">
                            <el-input v-model="stage.subjectName" placeholder="阶段名" />
                        </el-form-item>
                        <el-form-item label="摘要">
                            <el-input
                                v-model="stage.sketch"
                                type="textarea"
                                :autosize="{ minRows: 2 }"
                                placeholder="摘要"
                            />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary">更新</el-button>
                        </el-form-item>
                        <br />
                        <el-form-item>
                            <div style="border: 1px solid #e4e7ed; border-radius: 6px">
                                <div class="item">
                                    <div class="text">
                                        <div class="title">查看记录</div>
                                        <div class="info">查看本阶段的所有操作记录</div>
                                    </div>
                                    <div class="button">
                                        <el-button type="primary">查看</el-button>
                                    </div>
                                </div>
                            </div>
                        </el-form-item>
                        <br />
                        <el-form-item>
                            <div class="danger-zone">
                                <div class="item">
                                    <div class="text">
                                        <div class="title">公开本阶段</div>
                                        <div class="info">
                                            将本阶段公开至公共区域，本课程的其他师生可以查看并给出建议。公开后本阶段内容将不可修改。
                                        </div>
                                    </div>
                                    <div class="button">
                                        <el-button type="primary" plain>公开</el-button>
                                    </div>
                                </div>
                                <div class="item">
                                    <div class="text">
                                        <div class="title">提交审批</div>
                                        <div class="info">
                                            将本阶段提交审批。提交后本阶段内容不可修改，审批中无法废弃本阶段，无法新建阶段。
                                        </div>
                                    </div>
                                    <div class="button">
                                        <el-button type="primary" plain>提交</el-button>
                                    </div>
                                </div>
                                <div class="item">
                                    <div class="text">
                                        <div class="title">废弃</div>
                                        <div class="info">
                                            将本阶段废弃。废弃后的阶段依然会显示在时间轴上。
                                        </div>
                                    </div>
                                    <div class="button">
                                        <el-button type="danger" plain>废弃</el-button>
                                    </div>
                                </div>
                            </div>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import { getStageInfo } from "@/api/timeline-project"
import ProfilePopover from "@/components/ProfilePopover/profile-popover.vue"

export default {
    name: "StageManage",
    components: { ProfilePopover },
    data() {
        return {
            stageID: this.$route.params.id,
            stage: {},
            loading: true,
            avatarPath: process.env.VUE_APP_PUBLIC_PATH + process.env.VUE_APP_AVATAR_PATH,
            showUpPopoverKey: "",
        }
    },
    filters: {
        subjectNameFilter: val => {
            return val || "暂无阶段名"
        },
    },
    created() {
        this.getStageInfo()
    },
    methods: {
        toView() {
            this.$router.push("/course/section/activity/timeline/private/view/" + this.stageID)
        },
        getStageInfo() {
            let { stageID } = this
            this.loading = true
            getStageInfo({ stageID })
                .then(res => {
                    this.stage = res.data

                    this.loading = false
                })
                .catch()
        },
    },
}
</script>

<style lang='scss'>
.subtitle {
    // background-color: rgb(245, 245, 246);
    border-bottom: solid 1px #e4e7ed;
    .subject-name {
        align-items: center;
        display: flex;
        font-size: 22px;
        color: #303133;
        padding: 30px 40px 10px 40px;
    }
    .author-area {
        align-items: center;
        display: flex;
        font-size: 22px;
        color: #303133;
        padding: 10px 40px 20px 40px;
    }
}

.author-area {
    align-items: center;
    display: flex;
    font-size: 22px;
    color: #303133;
    padding: 10px 40px 20px 40px;
}

.container {
    padding: 40px;
}

.item {
    display: flex;
    align-items: center;
    padding: 16px;

    color: #303133;

    .title {
        font-size: 16px;
    }

    .info {
        line-height: 1.5715;
    }

    .button {
        margin-left: auto;
    }
}

.danger-zone {
    border: 1px solid #f56c6c;
    border-radius: 6px;
}
</style>
