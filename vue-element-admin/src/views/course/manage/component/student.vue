<template>
    <div style="padding-top: 15px">
        <div>
            <el-button type="primary" class="filter-item" icon="el-icon-upload2"
                >导入学生</el-button
            >
            <el-button
                type="primary"
                class="filter-item"
                icon="el-icon-document"
                :loading="exporting"
                @click="hanleExport"
                >导出Excel</el-button
            >
        </div>
        <el-table
            :data="
                studentList.filter(
                    (data) =>
                        !search ||
                        data.name
                            .toLowerCase()
                            .includes(search.trim().toLowerCase()) ||
                        data.username
                            .toLowerCase()
                            .includes(search.trim().toLowerCase())
                )
            "
            highlight-current-row
            style="width: 100%; margin-top: 20px"
            empty-text="暂无学生"
            v-loading="loading"
        >
            <el-table-column prop="username" label="学号" sortable />
            <el-table-column prop="name" label="姓名" />

            <el-table-column align="right">
                <template slot="header">
                    <el-input
                        v-model="search"
                        size="mini"
                        placeholder="输入关键字搜索"
                    />
                </template>
                <template slot-scope="scope">
                    <el-button size="mini" @click="handleMessage(scope.row._id)"
                        ><svg-icon
                            icon-class="email"
                        />&nbsp;发送私信</el-button
                    >
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import { getStudentList } from "@/api/course";
export default {
    name: "ManageStudent",
    props: ["courseId"],
    data() {
        return {
            studentList: [],
            tableHeader: ["学号", "姓名", "头像", "操作"],
            loading: true,
            path:
                process.env.VUE_APP_PUBLIC_PATH +
                process.env.VUE_APP_AVATAR_PATH,
            search: "",
            exporting: false,
        };
    },
    created() {
        this.getStudentList();
    },
    methods: {
        getStudentList() {
            getStudentList({ courseID: this.courseId })
                .then((res) => {
                    let { data } = res;
                    this.studentList = data.studentList;
                    this.loading = false;
                })
                .catch((err) => {
                    this.loading = false;
                });
        },
        handleMessage(uid) {
            console.log(uid);
        },
        hanleExport() {
            this.exporting = true;
            import("@/vendor/Export2Excel").then((excel) => {
                const tHeader = ["学号", "姓名"];
                const filterVal = ["username", "name"];
                const list = this.studentList;
                const data = this.formatJson(filterVal, list);
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: this.course.name + "学生数据",
                    autoWidth: tree,
                    bookType: "xlsx",
                });
                this.exporting = false;
            });
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map((v) =>
                filterVal.map((j) => {
                    if (j === "timestamp") {
                        return parseTime(v[j]);
                    } else {
                        return v[j];
                    }
                })
            );
        },
    },
};
</script>

<style scoped>
</style>
