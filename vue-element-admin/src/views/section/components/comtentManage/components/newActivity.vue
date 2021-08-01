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
                    <span v-if="type === 'TimeLineProject'"></span>

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
                        ></el-date-picker>
                    </el-form-item>
                    <el-form-item label="发言模板">
                        <el-radio-group v-model="settings.isUseCommentTemplate">
                            <el-radio-button :label="true">使用</el-radio-button>
                            <el-radio-button :label="false">不使用</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item v-if="settings.isUseCommentTemplate"></el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script>
export default {
    name: "CreateActivity",
    props: ["sectionId"],
    data() {
        return {
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
            },
            pickerOptions: {
                shortcuts: [
                    {
                        text: "一周内",
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 7)
                            picker.$emit("pick", [start, end])
                        },
                    },
                    {
                        text: "一个月内",
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 30)
                            picker.$emit("pick", [start, end])
                        },
                    },
                    {
                        text: "一季度内",
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 90)
                            picker.$emit("pick", [start, end])
                        },
                    },
                    {
                        text: "半年内",
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 90 * 2)
                            picker.$emit("pick", [start, end])
                        },
                    },
                    {
                        text: "一年内",
                        onClick(picker) {
                            const end = new Date()
                            const start = new Date()
                            end.setTime(start.getTime() + 3600 * 1000 * 24 * 90 * 2 * 2)
                            picker.$emit("pick", [start, end])
                        },
                    },
                ],
            },
        }
    },
}
</script>

<style lang="scss" scoped>
.container {
    padding: 50px 60px 0px;
}
</style>
