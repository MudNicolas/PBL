<template>
    <div class="wrapper" v-loading="loading">
        <el-form
            label-position="right"
            label-width="160px"
            :model="activity"
            ref="activityForm"
            :disabled="!editable"
        >
            <el-row>
                <el-col :span="16">
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
                        <el-select v-model="activity.type" placeholder="请选择" :disabled="true">
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
                        v-if="['TimeLineProject', 'Work'].includes(activity.type)"
                    >
                        <el-radio-group v-model="activity.authorType" :disabled="true">
                            <el-radio label="personal">个人</el-radio>
                            <el-radio label="group">小组</el-radio>
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
                        label="发言或互评模板"
                        :rules="{
                            required: true,
                        }"
                        v-if="['TimeLineProject', 'Forum'].includes(activity.type)"
                    >
                        <el-radio-group v-model="activity.isUseCommentTemplate">
                            <el-radio-button :label="true">使用</el-radio-button>
                            <el-radio-button :label="false">不使用</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <span
                        v-if="
                            activity.isUseCommentTemplate &&
                            ['TimeLineProject', 'Forum'].includes(activity.type)
                        "
                    >
                        <el-form-item
                            v-if="!updateCommentTemplate && activity.commentTemplate.length > 0"
                            label="当前模板"
                        >
                            <el-form style="padding-top: 6px">
                                <el-form-item
                                    v-for="entry of activity.commentTemplate"
                                    :key="'perview' + entry"
                                    style="margin-bottom: 12px"
                                >
                                    <el-input placeholder="具体评论..." :disabled="!editable">
                                        <template slot="prepend">
                                            {{ entry }}
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-form>
                            <el-button @click="updateCommentTemplate = true" v-show="editable">
                                更换发言模板
                            </el-button>
                        </el-form-item>
                        <el-form-item
                            v-else
                            label="选择模板"
                            :rules="{
                                required: true,
                            }"
                        >
                            <el-select
                                v-model="activity.commentTemplate"
                                placeholder="请选择"
                                :loading="templateGetting"
                                :change="(updateCommentTemplate = true)"
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
                    </span>

                    <el-form-item
                        label="项目审批"
                        :rules="{
                            required: true,
                        }"
                        v-if="['TimeLineProject'].includes(activity.type)"
                    >
                        <el-radio-group v-model="activity.isNeedApprove" :disabled="true">
                            <el-radio :label="true">需要</el-radio>
                            <el-radio :label="false">不需要</el-radio>
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
                        </span>
                        <span v-if="activity.evaluation.phaseSwitchMethod === 'manual'">
                            <el-form-item label="当前阶段">
                                <el-radio-group v-model="activity.evaluation.phase">
                                    <el-radio-button label="submission">
                                        作品提交阶段
                                    </el-radio-button>
                                    <el-radio-button label="evaluation">互评阶段</el-radio-button>
                                    <el-radio-button label="end">结束</el-radio-button>
                                </el-radio-group>
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
                    <el-form-item v-if="editable">
                        <el-button type="primary" @click="handleSubmit" :loading="submitting">
                            提交
                        </el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <el-button style="margin-left: 100px" @click="editable = true" v-if="!editable">
            编辑
        </el-button>
        <el-divider />
        <el-form label-position="right" label-width="100px">
            <el-row>
                <el-col :span="16">
                    <el-form-item>
                        <h2 style="font-weight: 400; margin-bottom: 8px">Danger Zone</h2>
                        <div class="danger-zone">
                            <div class="item">
                                <div class="text">
                                    <div class="title">移除活动</div>
                                    <div class="info">将本活动从本节中移除</div>
                                </div>
                                <div class="button">
                                    <el-button
                                        class="right-wrapper"
                                        type="danger"
                                        @click="removeActivity"
                                    >
                                        移除
                                    </el-button>
                                </div>
                            </div>
                        </div>
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
        <el-dialog title="移除活动" :visible.sync="removeComfirmVisible" width="30%">
            <span style="display: flex; flex-direction: column">
                <span style="display: flex; align-items: center">
                    <i class="el-icon-warning" />
                    <p style="color: #606266; line-height: 24px">
                        确认删除此活动？删除后本活动无法被访问，但如果是误操作可以联系管理员进行恢复。如果确定要删除本节，请输入本节名
                        <b>{{ removeConfirm.source }}</b>
                    </p>
                </span>
                <span style="margin-left: 36px">
                    <el-input v-model="removeConfirm.input" @keyup.enter.native="submitRemove" />
                </span>
            </span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="removeComfirmVisible = false">取 消</el-button>
                <el-button
                    type="primary"
                    :disabled="removeConfirm.source !== removeConfirm.input"
                    @click="submitRemove"
                    :loading="removeSubmitting"
                >
                    确 定
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { getActivityInfo, submitEditActivity, submitRemoveActivity } from "@/api/activityManage"
import { activityGetCommentTemplate, inActivitySubmitNewCommentTemplate } from "@/api/section"

export default {
    props: ["activityId"],
    name: "info",
    data() {
        return {
            removeComfirmVisible: false,
            removeConfirm: {
                source: "",
                input: "",
            },
            removeSubmitting: false,
            editable: false,
            updateCommentTemplate: false,
            activityID: this.activityId,
            newCommentTemplateDialogVisible: false,
            loading: true,
            newCommentTemplate: {
                name: "",
                entry: [{ value: "" }],
            },
            submitting: false,
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
                },
            },
            sectionID: "",
            templateGetting: false,
        }
    },
    watch: {
        "activity.isUseCommentTemplate"(v) {
            if (v) {
                this.getCommentTemplate()
            }
        },
    },
    created() {
        this.getInfo()
    },
    methods: {
        getInfo() {
            this.loading = true
            let { activityID } = this
            getActivityInfo({ activityID }).then(res => {
                let { type, options, name, intro, sectionID } = res.data

                let activity = {}

                if (type === "TimeLineProject") {
                    activity = options
                }
                if (type === "Evaluation") {
                    activity.evaluation = options
                }

                activity.name = name
                activity.intro = intro
                activity.type = type

                this.activity = activity

                this.sectionID = sectionID

                this.loading = false
            })
        },
        getCommentTemplate() {
            this.templateGetting = true
            activityGetCommentTemplate({ sectionID: this.sectionID })
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
        submitTemplate(formName) {
            this.entryValidate(formName)
                .then(temp => {
                    this.newTemplateSubmitting = true
                    inActivitySubmitNewCommentTemplate({
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
                .catch(err => {
                    console.log(err)
                })
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
            let activityInfo = data
            let { activityID } = this
            this.submitting = true
            submitEditActivity({ activityID, activityInfo })
                .then(() => {
                    this.submitting = false
                    this.$message.success("信息修改成功")
                    this.getInfo()
                    this.editable = false
                    this.updateCommentTemplate = false
                })
                .catch(err => {
                    console.log(err)
                    this.submitting = false
                })
        },
        entryValidate(formName) {
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
        formValidate() {
            this.activity.name = this.activity.name.trim()
            if (!this.activity.name) {
                return false
            }

            let type = this.activity.type
            if (type === "TimeLineProject") {
                let { isTimeLimited, limitTime } = this.activity
                if (isTimeLimited && !limitTime) {
                    return false
                }

                let { isUseCommentTemplate, commentTemplate } = this.activity
                if (isUseCommentTemplate && !Array.isArray(commentTemplate)) {
                    return false
                }
            }
            return true
        },
        transformData(type) {
            let data = {}
            let {
                name,
                intro,
                isTimeLimited,
                limitTime,
                isUseCommentTemplate,
                commentTemplate,
                evaluation,
            } = this.activity
            if (type === "TimeLineProject") {
                data = {
                    name,
                    intro,
                    isTimeLimited,
                    isUseCommentTemplate,
                }
                if (isTimeLimited) {
                    data.limitTime = limitTime
                }
                if (isUseCommentTemplate) {
                    data.commentTemplate = commentTemplate
                }
            }

            if (type === "Evaluation") {
                let { phaseSwitchMethod, submitLimitTime, evaluationLimitTime, phase } = evaluation
                data = {
                    name,
                    intro,
                    phaseSwitchMethod,
                }
                if (phaseSwitchMethod === "auto") {
                    data.submitLimitTime = submitLimitTime
                    data.evaluationLimitTime = evaluationLimitTime
                } else {
                    data.phase = phase
                }
            }

            return data
        },
        removeActivity() {
            this.removeConfirm.source = this.activity.name
            this.removeComfirmVisible = true
        },
        submitRemove() {
            if (this.removeConfirm.source !== this.removeConfirm.input || this.removeSubmitting) {
                return
            }
            this.removeSubmitting = true
            let { activityID } = this
            submitRemoveActivity({ activityID })
                .then(res => {
                    this.$message({
                        type: "success",
                        message: "删除成功",
                    })
                    let toPath = res.toPath
                    this.$router.replace(toPath)
                })
                .catch(err => console.log(err))
        },
    },
}
</script>

<style lang='scss' scoped>
.wrapper {
    padding-top: 30px;
}
.new-template-footbar {
    display: flex;
}
.danger-zone {
    border: 1px solid #f56c6c;
    border-radius: 6px;

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

    .item:not(:last-child) {
        border-bottom: 1px solid #e4e7ed;
    }
}
.el-icon-warning {
    color: #e6a23c;
    font-size: 24px;
    margin-right: 12px;
}
</style>
