<template>
    <div class="container" v-loading="loading">
        <el-table :data="works">
            <el-table-column label="作者" align="center">
                <template slot-scope="scope">
                    <el-popover
                        v-for="author of scope.row.authors"
                        :key="author._id"
                        placement="left"
                        trigger="hover"
                        :open-delay="200"
                        width="360"
                        @show="showUpPopoverKey = author._id"
                    >
                        <div>
                            <profile-popover
                                :uid="author._id"
                                :show-up-popover-key="showUpPopoverKey"
                            />
                        </div>
                        <span slot="reference">
                            <span style="margin-right: 8px">{{ author.name }}</span>
                        </span>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="作品" align="center">
                <template slot-scope="scope">
                    {{ scope.row.workName | workNameFilter }}
                </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center">
                <template slot-scope="scope">
                    {{ scope.row.createTime | normalFormatTime }}
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="查看" align="center">
                <template slot-scope="scope">
                    <el-button :disabled="!scope.row._id" @click="$router.push(`${scope.row._id}`)">
                        详情
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import ProfilePopover from "@/components/ProfilePopover/profile-popover.vue"
import { teacherGetAllWorks } from "@/api/evaluation"

export default {
    props: ["activityId"],
    filters: {
        normalFormatTime: val => {
            if (val) {
                return normalFormatTime(new Date(val))
            }
        },
        workNameFilter: val => {
            if (!val) {
                return "暂未提交作品"
            }
            return val
        },
    },

    components: { ProfilePopover },

    data() {
        return {
            loading: true,
            works: [],
            showUpPopoverKey: "",
        }
    },
    created() {
        this.teacherGetAllWorks()
    },
    methods: {
        teacherGetAllWorks() {
            this.loading = true
            let activityID = this.activityId
            teacherGetAllWorks({ activityID })
                .then(res => {
                    this.works = res.data
                    console.log(this.works)
                    this.loading = false
                })
                .catch(err => {
                    console.log(err)
                })
        },
    },
}
</script>

<style lang='scss' scoped>
.container {
    min-height: 40vh;
    padding-top: 20px;
}
</style>
