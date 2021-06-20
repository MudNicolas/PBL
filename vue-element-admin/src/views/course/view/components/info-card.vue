<template>
    <div>
        <el-card style="margin-bottom: 20px" :body-style="{ padding: '0px' }">
            <div class="course-profile">
                <div class="block">
                    <el-image :src="course.cover">
                        <div slot="placeholder" class="image-slot">
                            加载中<span class="dot">...</span>
                        </div>
                    </el-image>
                </div>

                <div style="padding: 20px">
                    <div class="box-center">
                        <div class="course-name text-center">
                            {{ course.name }}
                        </div>
                    </div>
                    <div class="course-teacher text-center text-muted">
                        {{ course.chiefTeacher.name }}
                        <span
                            v-if="course.partnerTeacher.length > 0"
                            class="course-teacher text-center text-muted"
                        >
                            <span
                                v-for="t of course.partnerTeacher"
                                :key="'view-partnerteacher' + t._id"
                            >
                                {{ t.name }}
                            </span>
                        </span>
                    </div>

                    <div class="course-bio">
                        <div class="course-education course-bio-section">
                            <div class="course-bio-section-header">
                                <svg-icon icon-class="education" /><span
                                    >Introduction</span
                                >
                            </div>
                            <div class="course-bio-section-body">
                                <div class="text-muted">
                                    {{ course.introduction }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script>
export default {
    name: "InfoCard",
    props: {
        course: {
            type: Object,
            default: () => {
                return {
                    name: "",
                    chiefTeacher: {
                        name: "",
                    },
                    partnerTeacher: [{ name: "" }],
                    cover: "",
                };
            },
        },
    },
};
</script>

<style lang="scss" scoped>
.box-center {
    margin: 0 auto;
    display: table;
}

.text-muted {
    color: #777;
}

.course-profile {
    .course-name {
        font-weight: bold;
    }

    .box-center {
        padding-top: 10px;
    }

    .course-teacher {
        padding-top: 10px;
        font-weight: 400;
        font-size: 14px;
        word-break: keep-all;
    }

    .box-social {
        padding-top: 30px;

        .el-table {
            border-top: 1px solid #dfe6ec;
        }
    }

    .course-follow {
        padding-top: 20px;
    }
}

.block {
    display: flex;
    background: #f5f7fa;
    justify-content: center;
    align-items: center;
    color: #c0c4cc;
    font-size: 14px;
}
.block::after {
    content: "";
    padding-top: 60%;
}

.course-bio {
    margin-top: 20px;
    color: #606266;

    span {
        padding-left: 4px;
    }

    .course-bio-section {
        font-size: 14px;
        padding: 15px 0;

        .course-bio-section-header {
            border-bottom: 1px solid #dfe6ec;
            padding-bottom: 10px;
            margin-bottom: 10px;
            font-weight: bold;
        }
    }
}
</style>
