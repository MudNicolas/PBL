<template>
    <div class="container">
        <transition name="fade-transform" mode="out-in">
            <div v-if="stage === 1" key="nas1">
                <el-form
                    label-position="right"
                    label-width="160px"
                    :model="activity"
                    ref="activityForm"
                >
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
                                        :disabled="item.disabled"
                                    ></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item
                                label="作者类型"
                                :rules="{
                                    required: true,
                                }"
                                v-if="
                                    ['TimeLineProject', 'Evaluation', 'Work'].includes(
                                        activity.type
                                    )
                                "
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
                                label="发言或互评模板"
                                :rules="{
                                    required: true,
                                }"
                                v-if="
                                    ['TimeLineProject', 'Forum', 'Evaluation'].includes(
                                        activity.type
                                    )
                                "
                            >
                                <el-radio-group v-model="activity.isUseCommentTemplate">
                                    <el-radio-button :label="true">使用</el-radio-button>
                                    <el-radio-button :label="false">不使用</el-radio-button>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item
                                v-if="
                                    activity.isUseCommentTemplate &&
                                    ['TimeLineProject', 'Forum'].includes(activity.type)
                                "
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
                                v-if="
                                    activity.isUseCommentTemplate &&
                                    ['Evaluation'].includes(activity.type)
                                "
                                label="互评模板"
                                :rules="{
                                    required: true,
                                }"
                            >
                                <el-select
                                    v-model="activity.evaluation.chosenInterEvaluationTemplate"
                                    placeholder="请选择"
                                    :loading="templateGetting"
                                >
                                    <el-option
                                        v-for="item in interEvaluationTemplates"
                                        :key="item._id"
                                        :label="item.name"
                                        :value="item.dimensions"
                                    >
                                        <span style="float: left">{{ item.name }}</span>
                                        <span style="float: right; color: #8492a6">
                                            <el-popover placement="right" trigger="hover">
                                                <el-form style="padding-top: 16px">
                                                    <el-form-item
                                                        v-for="dimension of item.dimensions"
                                                        :key="'perview' + dimension._id"
                                                        :label="dimension.dimensionName"
                                                    >
                                                        <el-row>
                                                            <el-col>
                                                                <el-rate
                                                                    v-model="reteValue"
                                                                    text-color="#ff9900"
                                                                ></el-rate>
                                                            </el-col>
                                                        </el-row>
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
                                    @click="newInterEvaluationTemplateDialogVisible = true"
                                >
                                    添加互评模板
                                </el-button>
                            </el-form-item>
                            <el-form-item
                                v-if="
                                    activity.evaluation.chosenInterEvaluationTemplate.length > 0 &&
                                    activity.isUseCommentTemplate &&
                                    ['Evaluation'].includes(activity.type)
                                "
                            >
                                <el-checkbox-group v-model="activity.evaluation.chosenDimensions">
                                    <el-checkbox
                                        v-for="d of activity.evaluation
                                            .chosenInterEvaluationTemplate"
                                        :key="d._id"
                                        :label="d._id"
                                    >
                                        {{ d.dimensionName }}
                                    </el-checkbox>
                                </el-checkbox-group>
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
                                    <el-radio-group
                                        v-model="activity.evaluation.isDiscussionTimeLimited"
                                    >
                                        <el-radio-button :label="true">是</el-radio-button>
                                        <el-radio-button :label="false">否</el-radio-button>
                                    </el-radio-group>
                                </el-form-item>
                                <span v-if="activity.evaluation.phaseSwitchMethod === 'auto'">
                                    <el-form-item
                                        label="开放提交作品时间"
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
                                        label="开放评价时间"
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
                                        label="开放讨论时间"
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
                                <el-button
                                    type="primary"
                                    @click="handleSubmit"
                                    :loading="submitting"
                                >
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
                                    <el-input
                                        v-model="entry.value"
                                        style="margin-right: 10px"
                                    ></el-input>
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
                                            <el-button slot="reference" type="danger">
                                                重置
                                            </el-button>
                                        </el-popconfirm>
                                    </div>
                                </el-col>
                            </el-row>
                        </el-form-item>
                    </el-form>
                </el-dialog>
                <el-dialog
                    title="新建互评模板"
                    :visible.sync="newInterEvaluationTemplateDialogVisible"
                    width="80%"
                >
                    <el-form>
                        <el-row>
                            <el-col>
                                <el-form-item style="margin-bottom: 0px">
                                    <upload-excel-component
                                        :on-success="handleLoadExcelSuccess"
                                        :before-upload="beforeLoadExcel"
                                        infoText="导入模板，将Excel文件拖到此处，或"
                                        :tHeader="[
                                            '维度',
                                            '1星文本',
                                            '2星文本',
                                            '3星文本',
                                            '4星文本',
                                            '5星文本',
                                        ]"
                                        :filterVal="[
                                            'dimension',
                                            'star1',
                                            'star2',
                                            'star3',
                                            'star4',
                                            'star5',
                                        ]"
                                    />
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row>
                            <el-col>
                                <el-form-item>
                                    <el-table
                                        :data="newInterEvaluationTemplate.dimensionList"
                                        border
                                        highlight-current-row
                                        style="width: 100%; margin-top: 20px"
                                    >
                                        <el-table-column prop="维度" label="维度" />
                                        <el-table-column prop="1星文本" label="1星文本" />
                                        <el-table-column prop="2星文本" label="2星文本" />
                                        <el-table-column prop="3星文本" label="3星文本" />
                                        <el-table-column prop="4星文本" label="4星文本" />
                                        <el-table-column prop="5星文本" label="5星文本" />
                                    </el-table>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item>
                                    <el-input
                                        v-model="newInterEvaluationTemplate.name"
                                        placeholder="模板名称*"
                                    ></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <div style="display: flex">
                            <el-button style="margin-left: auto" @click="resetLoadExcel">
                                取消
                            </el-button>
                            <el-button
                                type="primary"
                                :disabled="
                                    newInterEvaluationTemplate.dimensionList.length === 0 ||
                                    !newInterEvaluationTemplate.name.trim()
                                "
                                @click="handleSubmitNewInterEvaluationTemplate"
                                :loading="newDimensionSubmitting"
                            >
                                导入
                            </el-button>
                        </div>
                    </el-form>
                </el-dialog>
            </div>

            <div class="suc-wrapper" v-else key="nas2">
                <div class="wrapper-col">
                    <i class="el-icon-success suc-icon suc-wrapper"></i>
                    <div class="suc-wrapper">
                        <div class="suc-word">创建活动成功</div>
                    </div>
                    <div class="suc-wrapper">
                        <router-link :to="'/course/section/activity/view/' + activityID">
                            <el-button type="primary">进入活动</el-button>
                        </router-link>
                        <router-link :to="'/course/section/view/' + sectionID">
                            <el-button style="margin-left: 10px">返回节</el-button>
                        </router-link>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import {
    activityGetCommentTemplate,
    activityGetInterEvaluationTemplate,
    inActivitySubmitNewCommentTemplate,
    inActivitySubmitNewInterEvaluationTemplate,
} from "@/api/section"
import { submitCreateActivity } from "@/api/activity"
import UploadExcelComponent from "@/components/UploadExcel/index.vue"
export default {
    name: "CreateActivity",
    components: { UploadExcelComponent },
    created() {
        this.sectionID = this.$route.params.id
    },
    data() {
        return {
            activityID: "",
            submitting: false,
            stage: 1,
            sectionID: "",
            newCommentTemplate: {
                name: "",
                entry: [{ value: "" }],
            },
            newInterEvaluationTemplate: {
                name: "",
                dimensionList: [],
            },
            options: [
                {
                    value: "TimeLineProject",
                    label: "形成性项目",
                    disabled: false,
                },

                {
                    value: "Evaluation",
                    label: "互动评价",
                    disabled: false,
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
                    chosenInterEvaluationTemplate: [],
                    chosenDimensions: [],
                    phaseSwitchMethod: "auto",
                    submitLimitTime: "",
                    evaluationLimitTime: "",
                    discussionLimitTime: "",
                    isDiscussionTimeLimited: false,
                },
            },
            templateGetting: false,
            newCommentTemplateDialogVisible: false,
            newInterEvaluationTemplateDialogVisible: false,
            reteValue: 5,
            commentTemplates: [],
            interEvaluationTemplates: [],
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
            newDimensionSubmitting: false,
        }
    },
    watch: {
        "activity.isUseCommentTemplate": {
            handler(v) {
                if (v) {
                    if (["TimeLineProject", "Forum"].includes(this.activity.type))
                        this.getCommentTemplate()
                    if (["Evaluation"].includes(this.activity.type))
                        this.getInterEvaluationTemplate()
                }
            },
            immediate: true,
        },
        "activity.type": {
            handler(v) {
                if (v) {
                    if (["TimeLineProject", "Forum"].includes(v)) this.getCommentTemplate()
                    if (["Evaluation"].includes(v)) this.getInterEvaluationTemplate()
                }
            },
            immediate: true,
        },
        "activity.evaluation.chosenInterEvaluationTemplate": {
            handler(v) {
                if (v.length > 0) {
                    this.activity.evaluation.chosenDimensions = v.map(e => e._id)
                }
            },
        },
    },
    methods: {
        getInterEvaluationTemplate() {
            this.templateGetting = true
            activityGetInterEvaluationTemplate({ sectionID: this.sectionID })
                .then(res => {
                    this.templateGetting = false
                    this.interEvaluationTemplates = res.data
                })
                .catch(err => {
                    console.log(err)
                })
        },
        getCommentTemplate() {
            this.templateGetting = true
            activityGetCommentTemplate({ sectionID: this.sectionID })
                .then(res => {
                    this.templateGetting = false
                    this.commentTemplates = res.data
                })
                .catch(err => {
                    console.log(err)
                })
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
                .catch(() => {})
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
                .then(res => {
                    this.submitting = false
                    this.activityID = res.data.activityID
                    this.stage = 2
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
                if (isUseCommentTemplate && !Array.isArray(commentTemplate)) {
                    return false
                }
            }
            if (type === "Evaluation") {
                let { isUseCommentTemplate } = this.activity

                let {
                    chosenDimensions,
                    phaseSwitchMethod,
                    isDiscussionTimeLimited,
                    submitLimitTime,
                    evaluationLimitTime,
                    discussionLimitTime,
                } = this.activity.evaluation
                if (isUseCommentTemplate && !Array.isArray(chosenDimensions)) return false

                if (phaseSwitchMethod === "auto") {
                    if (!Array.isArray(submitLimitTime) || !Array.isArray(evaluationLimitTime))
                        return false
                    if (isDiscussionTimeLimited && !Array.isArray(discussionLimitTime)) return false
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
            //console.log(type)
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
            if (type == "Evaluation") {
                let {
                    chosenDimensions,
                    phaseSwitchMethod,
                    submitLimitTime,
                    evaluationLimitTime,
                    discussionLimitTime,
                    isDiscussionTimeLimited,
                } = evaluation
                data = {
                    name,
                    intro,
                    type,
                    authorType,
                    phaseSwitchMethod,
                    isUseCommentTemplate,
                }

                if (isUseCommentTemplate) {
                    data.dimensions = chosenDimensions
                }
                if (phaseSwitchMethod === "auto") {
                    data.submitLimitTime = submitLimitTime
                    data.evaluationLimitTime = evaluationLimitTime
                    data.isDiscussionTimeLimited = isDiscussionTimeLimited
                    if (isDiscussionTimeLimited) {
                        data.discussionLimitTime = discussionLimitTime
                    }
                }
            }

            return data
        },

        handleLoadExcelSuccess({ results }) {
            let newDimensionList = []
            // console.log(results)
            for (let dimension of results) {
                if (!this.checkDimension(dimension)) {
                    this.$message({
                        type: "warning",
                        message: "文件错误，请遵循模板格式填入信息！",
                    })

                    return false
                } else {
                    dimension["维度"] = (dimension["维度"] || "").toString().trim()
                    for (let i = 1; i <= 5; i++) {
                        dimension[`${i}星文本`] = (dimension[`${i}星文本`] || "").toString().trim()
                    }
                    newDimensionList.push(dimension)
                }
            }
            this.newInterEvaluationTemplate.dimensionList = newDimensionList
        },
        checkDimension(d) {
            d["维度"] = (d["维度"] || "").toString().trim()
            if (!d["维度"]) return false

            for (let i = 1; i <= 5; i++) {
                d[`${i}星文本`] = (d[`${i}星文本`] || "").toString().trim()
                if (!d[`${i}星文本`]) return false
            }
            return true
        },
        beforeLoadExcel(file) {
            const isLt1M = file.size / 1024 / 1024 < 1

            if (isLt1M) {
                return true
            }

            this.$message({
                message: "文件大小限制1MB",
                type: "warning",
            })
            return false
        },
        resetLoadExcel() {
            this.newInterEvaluationTemplateDialogVisible = false
            this.newDimensionSubmitting = false
            this.newInterEvaluationTemplate = {
                name: "",
                dimensionList: [],
            }
        },
        handleSubmitNewInterEvaluationTemplate() {
            this.newDimensionSubmitting = true
            let list = this.newInterEvaluationTemplate.dimensionList
            let newTemplateName = this.newInterEvaluationTemplate.name
            // console.log(newTemplateName, list)
            for (let dimension of list) {
                if (!this.checkDimension(dimension)) {
                    this.$message({
                        type: "warning",
                        message: "文件错误，请遵循模板格式填入信息！",
                    })
                    return false
                }
            }
            if (!newTemplateName.trim()) {
                this.$message({
                    type: "warning",
                    message: "请输入模板名称",
                })
                return false
            }
            let data = {
                newTemplateName,
                dimensionList: list,
            }
            inActivitySubmitNewInterEvaluationTemplate({
                sectionID: this.sectionID,
                template: data,
            })
                .then(() => {
                    this.$message({
                        type: "success",
                        message: "添加模板成功",
                    })

                    this.getInterEvaluationTemplate()
                    this.resetLoadExcel()
                })
                .catch(err => {
                    this.$message.error(err)
                })
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
.suc-wrapper {
    display: flex;
    justify-content: center;
    padding-top: 28px;
}
.wrapper-col {
    flex-direction: column;
}
.suc-icon {
    font-size: 14rem;
    color: rgb(17, 169, 131);
}
.suc-word {
    font-size: 1.4rem;
}
</style>
