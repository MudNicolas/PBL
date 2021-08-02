<template>
    <div class="container">
        <el-form label-position="right" label-width="80px">
            <el-row>
                <el-col :span="16" :offset="4">
                    <el-form-item label="名称">
                        <el-input />
                    </el-form-item>
                    <el-form-item label="描述">
                        <el-input type="textarea" />
                    </el-form-item>
                    <el-form-item label="类型">
                        <el-select v-model="type" placeholder="请选择">
                            <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            ></el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="限时">
                        <el-radio-group v-model="settings.isTimeLimited">
                            <el-radio-button :label="true">是</el-radio-button>
                            <el-radio-button :label="false">否</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item v-if="settings.isTimeLimited" label="起止时间">
                        <el-date-picker
                            v-model="settings.limitTime"
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
                    <el-form-item label="发言模板">
                        <el-radio-group v-model="settings.isUseCommentTemplate">
                            <el-radio-button :label="true">使用</el-radio-button>
                            <el-radio-button :label="false">不使用</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item v-if="settings.isUseCommentTemplate" label="模板">
                        <el-select
                            v-model="settings.commentTemplate"
                            placeholder="请选择"
                            :loading="templateGetting"
                        >
                            <el-option
                                v-for="item in commentTemplates"
                                :key="item._id"
                                :label="item.name"
                                :value="item._id"
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
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script>
import { newActivityGetCommentTemplate } from "@/api/section"
export default {
    name: "CreateActivity",
    created() {
        this.sectionID = this.$route.params.id
    },
    data() {
        return {
            sectionID: "",
            options: [
                {
                    value: "TimeLineProject",
                    label: "形成性项目",
                },
                {
                    value: "Forum",
                    label: "论坛",
                },
            ],
            type: "",
            settings: {
                isTimeLimited: false,
                limitTime: "",
                isUseCommentTemplate: false,
                template: [],
                commentTemplate: [],
            },
            templateGetting: false,

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
        }
    },
    watch: {
        "settings.isUseCommentTemplate"(v) {
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
    },
}
</script>

<style lang="scss" scoped>
.container {
    padding: 50px 60px 0px;
}
</style>
