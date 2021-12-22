<template>
    <!--TODO：可按节显示发言情况，可显示总体发言情况，可显示发言情况排名-->
    <div class="container" v-loading="!dataRecevied">
        <div v-if="dataRecevied">
            <p>注：default为普通评论，即不受条目制约的评论</p>
            <group-chart
                v-for="member of groupMemberData"
                :key="member._id"
                :personalOrGroupTotalData="member.data"
                :classData="classData"
                :indicator="indicator"
                :title="`${member.name}互动情况`"
                :legend="[member.name, '班级平均互动', '班级最高互动']"
            />
            <group-chart
                :personalOrGroupTotalData="personalOrGroupTotalData"
                :classData="classData"
                :indicator="indicator"
                :legend="['个人或小组总互动', '班级平均互动', '班级最高互动']"
            />
            <StatisticTable
                v-if="groupMemberData.length > 0"
                :groupData="personalOrGroupTotalData"
                :classData="classData"
                :memberData="groupMemberData"
            />
        </div>
    </div>
</template>

<script>
import groupChart from "./components/group.vue"
import { getTimelineStatisticData } from "@/api/statistic"
import StatisticTable from "@/components/StatisticTable"

export default {
    components: { groupChart, StatisticTable },
    data() {
        return {
            dataRecevied: false,
            chartData: [],
            activityID: this.$route.params.id,
            groupMemberData: [],
            personalOrGroupTotalData: [],
            classData: [],

            indicator: [], //评论数，回复数，entry评论数，default
        }
    },
    created() {
        this.getData()
    },
    methods: {
        getData() {
            let activityID = this.activityID
            getTimelineStatisticData({ activityID })
                .then(res => {
                    let { data } = res
                    let { classData, personalOrGroupTotalData, groupMemberData, commentTemplate } =
                        data
                    //console.log(data)
                    this.groupMemberData = groupMemberData.map(e => ({
                        name: e.name,
                        data: this.processPersonalOrGroupData(e, commentTemplate),
                        _id: e._id,
                    }))
                    this.personalOrGroupTotalData = this.processPersonalOrGroupData(
                        personalOrGroupTotalData,
                        commentTemplate
                    )
                    this.classData = this.processClassData(classData, commentTemplate) //this.processPersonalOrGroupData(classData, commentTemplate)
                    this.indicator = [
                        {
                            name: "评论数",
                        },
                        {
                            name: "回复数",
                        },
                    ]
                    this.indicator = this.indicator.concat(commentTemplate.map(e => ({ name: e })))

                    this.dataRecevied = true
                })
                .catch(err => {
                    console.log(err)
                })
        },
        processPersonalOrGroupData(personalOrGroupTotalData, commentTemplate) {
            let processPersonalOrGroupTotalData = [
                personalOrGroupTotalData.dataPersonalOrGroupCommentNumber,
                personalOrGroupTotalData.dataPersonalOrGroupReplyNumber,
                ...this.processEntryData(
                    personalOrGroupTotalData.dataPersonalOrGroupEntryCommentNumber,
                    commentTemplate
                ),
            ]

            return processPersonalOrGroupTotalData
        },
        processClassData(classData, commentTemplate) {
            return {
                avg: [
                    classData.avg.dataAvgComment,
                    classData.avg.dataAvgReply,
                    ...this.processEntryData(classData.avg.dataAvgEntry, commentTemplate),
                ],
                most: [
                    classData.most.dataMostComment,
                    classData.most.dataMostReply,
                    ...this.processEntryData(classData.most.dataMostEntryComment, commentTemplate),
                ],
            }
        },
        processEntryData(EntryCommentNumber, commentTemplate) {
            return [
                ...commentTemplate.map(c => {
                    return EntryCommentNumber.find(e => e.entry === c).dataEntryComment || 0
                }),
                EntryCommentNumber.find(e => e.entry === "default").dataEntryComment,
            ]
        },
    },
}
</script>

<style lang='scss' scoped>
.container {
    min-height: 40vh;
    padding-top: 20px;
}
p {
    font-size: 14px;
    margin-bottom: 24px;
}
</style>
