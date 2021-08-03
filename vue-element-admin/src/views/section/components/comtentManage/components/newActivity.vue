<template>
    <div class="container">
        <el-form label-position="right" label-width="120px" :model="activity" ref="activityForm">
            <el-row>
                <el-col :span="16" :offset="4">
                    <el-form-item
                        label="名称"
                        prop="name"
                        :rules="{
                            required: true,
                            message: '名称不能为空',
                            trigger: 'blur',
                        }"
                    >
                        <el-input v-model="activity.name" />
                    </el-form-item>

                    <el-form-item
                        label="类型"
                        :rules="{
                            required: true,
                        }"
                    >
                        <el-select v-model="activity.type" placeholder="请选择">
                            <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            ></el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item
                        label="作者类型"
                        :rules="{
                            required: true,
                        }"
                        v-if="['TimeLineProject', 'Evaluation', 'Work'].includes(activity.type)"
                    >
                        <el-radio-group v-model="activity.authorType">
                            <el-radio-button label="personal">个人</el-radio-button>
                            <el-radio-button label="group">小组</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item
                        label="限时"
                        :rules="{
                            required: true,
                        }"
                        v-if="['TimeLineProject', 'Forum', 'Work'].includes(activity.type)"
                    >
                        <el-radio-group v-model="activity.isTimeLimited">
                            <el-radio-button :label="true">是</el-radio-button>
                            <el-radio-button :label="false">否</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item
                        v-if="activity.isTimeLimited"
                        label="起止时间"
                        :rules="{
                            required: true,
                        }"
                    >
                        <el-date-picker
                            v-model="activity.limitTime"
                            type="datetimerange"
                            :picker-options="pickerOptions"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            align="left"
                            :default-time="['00:00:00', '23:59:59']"
                        >
                            >
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item
                        label="发言模板"
                        :rules="{
                            required: true,
                        }"
                        v-if="['TimeLineProject', 'Forum', 'Evaluation'].includes(activity.type)"
                    >
                        <el-radio-group v-model="activity.isUseCommentTemplate">
                            <el-radio-button :label="true">使用</el-radio-button>
                            <el-radio-button :label="false">不使用</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item
                        v-if="activity.isUseCommentTemplate"
                        label="模板"
                        :rules="{
                            required: true,
                        }"
                    >
                        <el-select
                            v-model="activity.commentTemplate"
                            placeholder="请选择"
                            :loading="templateGetting"
                        >
                            <el-option
                                v-for="item in commentTemplates"
                                :key="item._id"
                                :label="item.name"
                                :value="item.template"
                            >
                                <span style="float: left">{{ item.name }}</span>
                                <span style="float: right; color: #8492a6">
                                    <el-popover placement="right" trigger="hover">
                                        <el-form style="padding-top: 16px">
                                            <el-form-item
                                                v-for="entry of item.template"
                                                :key="'perview' + entry"
                                            >
                                                <el-input placeholder="具体评论...">
                                                    <template slot="prepend">
                                                        {{ entry }}
                                                    </template>
                                                </el-input>
                                            </el-form-item>
                                        </el-form>
                                        <i slot="reference" class="el-icon-view" />
                                    </el-popover>
                                </span>
                            </el-option>
                        </el-select>
                        <el-button
                            style="margin-left: 10px"
                            icon="el-icon-plus"
                            @click="newCommentTemplateDialogVisible = true"
                        >
                            添加发言模板
                        </el-button>
                    </el-form-item>
                    <el-form-item
                        label="项目审批"
                        :rules="{
                            required: true,
                        }"
                        v-if="['TimeLineProject'].includes(activity.type)"
                    >
                        <el-radio-group v-model="activity.isNeedApprove">
                            <el-radio-button :label="true">需要</el-radio-button>
                            <el-radio-button :label="false">不需要</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <span v-if="['Evaluation'].includes(activity.type)">
                        <el-form-item
                            label="阶段切换方式"
                            :rules="{
                                required: true,
                            }"
                        >
                            <el-radio-group v-model="activity.evaluation.phaseSwitchMethod">
                                <el-radio-button label="auto">自动</el-radio-button>
                                <el-radio-button label="manual">手动</el-radio-button>
                            </el-radio-group>

                            <el-tooltip
                                content="互评分为三个阶段，分别是作品提交阶段、评价阶段、讨论阶段。自动适用于长时间大型项目，手动适用于短时间课堂活动"
                                placement="right"
                                effect="light"
                            >
                                <i
                                    class="el-icon-question"
                                    style="color: #606266; margin-left: 10px"
                                />
                            </el-tooltip>
                        </el-form-item>

                        <el-form-item
                            label="讨论阶段限时"
                            v-if="activity.evaluation.phaseSwitchMethod === 'auto'"
                            :rules="{
                                required: true,
                            }"
                        >
                            <el-radio-group v-model="activity.evaluation.isDiscussionTimeLimited">
                                <el-radio-button :label="true">是</el-radio-button>
                                <el-radio-button :label="false">否</el-radio-button>
                            </el-radio-group>
                        </el-form-item>
                        <span v-if="activity.evaluation.phaseSwitchMethod === 'auto'">
                            <el-form-item
                                label="作品提交时间"
                                :rules="{
                                    required: true,
                                }"
                            >
                                <el-date-picker
                                    v-model="activity.evaluation.submitLimitTime"
                                    type="datetimerange"
                                    :picker-options="pickerOptions"
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期"
                                    align="left"
                                    :default-time="['00:00:00', '23:59:59']"
                                >
                                    >
                                </el-date-picker>
                            </el-form-item>
                            <el-form-item
                                label="评价时间"
                                :rules="{
                                    required: true,
                                }"
                            >
                                <el-date-picker
                                    v-model="activity.evaluation.evaluationLimitTime"
                                    type="datetimerange"
                                    :picker-options="pickerOptions"
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期"
                                    align="left"
                                    :default-time="['00:00:00', '23:59:59']"
                                >
                                    >
                                </el-date-picker>
                            </el-form-item>

                            <el-form-item
                                label="讨论时间"
                                v-if="activity.evaluation.isDiscussionTimeLimited"
                                :rules="{
                                    required: true,
                                }"
                            >
                                <el-date-picker
                                    v-model="activity.evaluation.discussionLimitTime"
                                    type="datetimerange"
                                    :picker-options="pickerOptions"
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期"
                                    align="left"
                                    :default-time="['00:00:00', '23:59:59']"
                                >
                                    >
                                </el-date-picker>
                            </el-form-item>
                        </span>
                    </span>
                    <el-form-item label="描述">
                        <el-input
                            type="textarea"
                            v-model="activity.intro"
                            :autosize="{ minRows: 3 }"
                        />
                    </el-form-item>
                    <el-form-item v-if="activity.type">
                        <el-button type="primary" @click="handleSubmit" :loading="submitting">
                            提交
                        </el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <el-dialog title="新建发言模板" :visible.sync="newCommentTemplateDialogVisible">
            <el-form
                :model="newCommentTemplate"
                ref="newCommentTemplate"
                label-position="right"
                label-width="80px"
            >
                <el-form-item
                    prop="name"
                    label="模板名"
                    :rules="{
                        required: true,
                        message: '模板名不能为空',
                        trigger: 'blur',
                    }"
                >
                    <el-row>
                        <el-col :span="16">
                            <el-input v-model="newCommentTemplate.name"></el-input>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item
                    v-for="(entry, index) of newCommentTemplate.entry"
                    :label="'条目' + index"
                    :key="entry.key"
                    :prop="'entry.' + index + '.value'"
                    :rules="{
                        required: true,
                        message: '条目不能为空',
                        trigger: 'blur',
                    }"
                >
                    <el-row>
                        <el-col :span="16">
                            <el-input v-model="entry.value" style="margin-right: 10px"></el-input>
                        </el-col>

                        <el-button
                            v-if="newCommentTemplate.entry.length > 1"
                            @click.prevent="removeEntry(entry)"
                            style="margin-left: 12px"
                            type="danger"
                        >
                            删除
                        </el-button>
                    </el-row>
                </el-form-item>
                <el-form-item>
                    <el-row>
                        <el-col :span="16">
                            <div class="new-template-footbar">
                                <el-button @click="addEntry">新增条目</el-button>
                                <el-button
                                    type="primary"
                                    :loading="newTemplateSubmitting"
                                    @click="submitTemplate('newCommentTemplate')"
                                >
                                    提交
                                </el-button>
                                <el-popconfirm
                                    title="确定将输入的信息重置吗？"
                                    style="margin-left: auto"
                                    @confirm="resetTemplate('newCommentTemplate')"
                                >
                                    <el-button slot="reference" type="danger">重置</el-button>
                                </el-popconfirm>
                            </div>
                        </el-col>
                    </el-row>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import { newActivityGetCommentTemplate, newActivitySubmitNewCommentTemplate } from "@/api/section"
import { submitCreateActivity } from "@/api/activity"
export default {
    name: "CreateActivity",
    created() {
        this.sectionID = this.$route.params.id
    },
    data() {
        return {
            submitting: false,
            sectionID: "",
            newCommentTemplate: {
                name: "",
                entry: [{ value: "" }],
            },
            options: [
                {
                    value: "TimeLineProject",
                    label: "形成性项目",
                },
                {
                    value: "Forum",
                    label: "论坛",
                },
                {
                    value: "Evaluation",
                    label: "互动评价",
                },
                {
                    value: "Work",
                    label: "作业提交",
                },
            ],

            /**
             * @	* -> must
             * @ 	+ -> conditionally
             * @name *all
             * @intro all
             * @isTimeLimited *timeline *forum *work
             * @limitTime +timeline +forum +work
             * @isUseComtemplate *timeline *forum *evaluation
             * @commentTemplate +timeline +forum +evaluation
             * @isNeedApprove *timeline
             * @author	*timeline *evaluation *work
             */
            activity: {
                name: "",
                intro: "",
                type: "",
                isTimeLimited: false,
                limitTime: "",
                isUseCommentTemplate: false,
                commentTemplate: [],
                isNeedApprove: false,
                authorType: "personal",
                evaluation: {
                    phaseSwitchMethod: "auto",
                    submitLimitTime: "",
                    evaluationLimitTime: "",
                    discussionLimitTime: "",
                    isDiscussionTimeLimited: false,
                },
            },
            templateGetting: false,
            newCommentTemplateDialogVisible: false,
            commentTemplates: [],
            pickerOptions: {
                shortcuts: [
                    {
                        text: "一周内(7)",
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date(
                                new Date().getFullYear(),
                                new Date().getMonth(),
                                new Date().getDate()
                            )
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 7 - 1)
                            picker.$emit("pick", [start, end])
                        },
                    },
                    {
                        text: "一个月内(30)",
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date(
                                new Date().getFullYear(),
                                new Date().getMonth(),
                                new Date().getDate()
                            )
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 30 - 1)
                            picker.$emit("pick", [start, end])
                        },
                    },
                    {
                        text: "一季度内(90)",
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date(
                                new Date().getFullYear(),
                                new Date().getMonth(),
                                new Date().getDate()
                            )
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 90 - 1)
                            picker.$emit("pick", [start, end])
                        },
                    },
                    {
                        text: "半年内(180)",
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date(
                                new Date().getFullYear(),
                                new Date().getMonth(),
                                new Date().getDate()
                            )
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 90 * 2 - 1)
                            picker.$emit("pick", [start, end])
                        },
                    },
                    {
                        text: "一年内(360)",
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date(
                                new Date().getFullYear(),
                                new Date().getMonth(),
                                new Date().getDate()
                            )
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 90 * 2 * 2 - 1)
                            picker.$emit("pick", [start, end])
                        },
                    },
                ],
            },
            newTemplateSubmitting: false,
        }
    },
    watch: {
        "activity.isUseCommentTemplate"(v) {
            if (v) {
                this.getCommentTemplate()
            }
        },
    },
    methods: {
        getCommentTemplate() {
            this.templateGetting = true
            newActivityGetCommentTemplate({ sectionID: this.sectionID })
                .then(res => {
                    this.templateGetting = false
                    this.commentTemplates = res.data
                })
                .catch()
        },
        resetTemplate(formName) {
            this.$refs[formName].resetFields()
            this.newCommentTemplate = {
                name: "",
                entry: [{ value: "" }],
            }
        },
        removeEntry(item) {
            let index = this.newCommentTemplate.entry.indexOf(item)
            if (index !== -1) {
                this.newCommentTemplate.entry.splice(index, 1)
            }
        },
        formValidate(formName) {
            return new Promise((resolve, reject) => {
                this[formName].name = this[formName].name.trim()
                this[formName].entry.forEach(e => {
                    e.value = e.value.trim()
                })
                this.$refs[formName].validate(valid => {
                    if (valid) {
                        let temp = Object.assign({}, this[formName])
                        let entry = temp.entry.map(e => {
                            return e.value
                        })
                        temp.entry = entry
                        //console.log(temp)
                        resolve(temp)
                        return
                    } else {
                        this.$message({
                            message: "请将信息填写完整",
                            type: "warning",
                        })
                        reject()
                        return
                    }
                })
            })
        },
        submitTemplate(formName) {
            this.formValidate(formName)
                .then(temp => {
                    this.newTemplateSubmitting = true
                    newActivitySubmitNewCommentTemplate({
                        sectionID: this.sectionID,
                        template: temp,
                    })
                        .then(() => {
                            this.$message({
                                type: "success",
                                message: "添加模板成功",
                            })
                            this.newTemplateSubmitting = false
                            this.getCommentTemplate()
                            this.resetTemplate("newCommentTemplate")
                            this.newCommentTemplateDialogVisible = false
                        })
                        .catch(() => {
                            this.newTemplateSubmitting = false
                        })
                })
                .catch()
        },
        addEntry() {
            this.newCommentTemplate.entry.push({
                value: "",
                key: Date.now(),
            })
        },
        handleSubmit() {
            let valid = this.formValidate()
            if (!valid) {
                this.$message.error("请完整填写表单必要内容")
                return
            }
            let type = this.activity.type
            let data = this.transformData(type)
            this.submit(data)
        },
        submit(data) {
            let sectionID = this.sectionID
            let activity = data
            this.submitting = true
            submitCreateActivity({ sectionID, activity })
                .then(() => {
                    this.submitting = false
                })
                .catch(() => {
                    this.submitting = false
                })
        },
        formValidate() {
            this.activity.name = this.activity.name.trim()
            if (!this.activity.name) {
                return false
            }
            let type = this.activity.type
            if (!type || !["TimeLineProject", "Forum", "Work", "Evaluation"].includes(type)) {
                return false
            }
            if (type === "TimeLineProject") {
                let { isTimeLimited, limitTime } = this.activity
                if (isTimeLimited && !limitTime) {
                    return false
                }
                let { isUseCommentTemplate, commentTemplate } = this.activity
                if (isUseCommentTemplate && !commentTemplate) {
                    return false
                }
            }
            return true
        },
        transformData() {
            let data = {}
            let {
                name,
                intro,
                type,
                authorType,
                isTimeLimited,
                limitTime,
                isUseCommentTemplate,
                commentTemplate,
                isNeedApprove,
                evaluation,
            } = this.activity
            if (type === "TimeLineProject") {
                data = {
                    name,
                    intro,
                    type,
                    authorType,
                    isTimeLimited,
                    isUseCommentTemplate,
                    isNeedApprove,
                }
                if (isTimeLimited) {
                    data.limitTime = limitTime
                }
                if (isUseCommentTemplate) {
                    data.commentTemplate = commentTemplate
                }
            }

            return data
        },
    },
}
</script>

<style lang="scss" scoped>
.container {
    padding: 50px 60px 0px;
}
.new-template-footbar {
    display: flex;
}
</style>
