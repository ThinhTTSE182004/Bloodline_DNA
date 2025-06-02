using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Login.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Collection_method",
                columns: table => new
                {
                    collection_method_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    method_name = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Collecti__1B185E47B96E21CE", x => x.collection_method_id);
                });

            migrationBuilder.CreateTable(
                name: "Participant",
                columns: table => new
                {
                    participant_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    full_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    sex = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    birth_date = table.Column<DateOnly>(type: "date", nullable: false),
                    phone = table.Column<decimal>(type: "decimal(12,0)", nullable: true),
                    relationship = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Particip__4E037806DF082528", x => x.participant_id);
                });

            migrationBuilder.CreateTable(
                name: "Permission",
                columns: table => new
                {
                    permission_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    permission_name = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Permissi__E5331AFA883316B6", x => x.permission_id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    role_name = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Roles__760965CCF7573CC2", x => x.role_id);
                });

            migrationBuilder.CreateTable(
                name: "Sample_type",
                columns: table => new
                {
                    sample_type_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Sample_t__52C64896B93A529D", x => x.sample_type_id);
                });

            migrationBuilder.CreateTable(
                name: "Service_package",
                columns: table => new
                {
                    service_package_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    service_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    duration = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Service___968593276BBEA96B", x => x.service_package_id);
                });

            migrationBuilder.CreateTable(
                name: "Role_Permission",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "int", nullable: false),
                    permission_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Role_Per__C85A54635B7C1482", x => new { x.role_id, x.permission_id });
                    table.ForeignKey(
                        name: "FK__Role_Perm__permi__4AB81AF0",
                        column: x => x.permission_id,
                        principalTable: "Permission",
                        principalColumn: "permission_id");
                    table.ForeignKey(
                        name: "FK__Role_Perm__role___49C3F6B7",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "role_id");
                });

            migrationBuilder.CreateTable(
                name: "USERS",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    role_id = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__USERS__B9BE370FE5534A4D", x => x.user_id);
                    table.ForeignKey(
                        name: "FK__USERS__role_id__403A8C7D",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "role_id");
                });

            migrationBuilder.CreateTable(
                name: "Choose_method",
                columns: table => new
                {
                    service_package_id = table.Column<int>(type: "int", nullable: true),
                    collection_method_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.ForeignKey(
                        name: "FK__Choose_me__colle__59FA5E80",
                        column: x => x.collection_method_id,
                        principalTable: "Collection_method",
                        principalColumn: "collection_method_id");
                    table.ForeignKey(
                        name: "FK__Choose_me__servi__59063A47",
                        column: x => x.service_package_id,
                        principalTable: "Service_package",
                        principalColumn: "service_package_id");
                });

            migrationBuilder.CreateTable(
                name: "Service_price",
                columns: table => new
                {
                    service_price_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    service_package_id = table.Column<int>(type: "int", nullable: false),
                    price = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Service___B715FBB704FCF3E8", x => x.service_price_id);
                    table.ForeignKey(
                        name: "FK__Service_p__servi__5CD6CB2B",
                        column: x => x.service_package_id,
                        principalTable: "Service_package",
                        principalColumn: "service_package_id");
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    order_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    customer_id = table.Column<int>(type: "int", nullable: false),
                    collection_method_id = table.Column<int>(type: "int", nullable: false),
                    order_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    create_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    update_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Orders__4659622970B040CD", x => x.order_id);
                    table.ForeignKey(
                        name: "FK__Orders__collecti__6383C8BA",
                        column: x => x.collection_method_id,
                        principalTable: "Collection_method",
                        principalColumn: "collection_method_id");
                    table.ForeignKey(
                        name: "FK__Orders__customer__628FA481",
                        column: x => x.customer_id,
                        principalTable: "USERS",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Sample_transfer",
                columns: table => new
                {
                    transfer_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    staff_id = table.Column<int>(type: "int", nullable: false),
                    medical_staff_id = table.Column<int>(type: "int", nullable: false),
                    transfer_date = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    sample_transfer_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Sample_t__78E6FD338DCEF5FB", x => x.transfer_id);
                    table.ForeignKey(
                        name: "FK__Sample_tr__medic__1AD3FDA4",
                        column: x => x.medical_staff_id,
                        principalTable: "USERS",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Sample_tr__staff__19DFD96B",
                        column: x => x.staff_id,
                        principalTable: "USERS",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "User_profile",
                columns: table => new
                {
                    profile_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__User_pro__AEBB701F1DE90570", x => x.profile_id);
                    table.ForeignKey(
                        name: "FK__User_prof__user___46E78A0C",
                        column: x => x.user_id,
                        principalTable: "USERS",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Delivery",
                columns: table => new
                {
                    delivery_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_id = table.Column<int>(type: "int", nullable: false),
                    delivery_address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    delivery_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    delivery_date = table.Column<DateOnly>(type: "date", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Delivery__1C5CF4F584C05B01", x => x.delivery_id);
                    table.ForeignKey(
                        name: "FK__Delivery__order___6C190EBB",
                        column: x => x.order_id,
                        principalTable: "Orders",
                        principalColumn: "order_id");
                });

            migrationBuilder.CreateTable(
                name: "Feedback",
                columns: table => new
                {
                    feedback_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_id = table.Column<int>(type: "int", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    rating = table.Column<decimal>(type: "decimal(2,1)", nullable: false),
                    comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    create_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    update_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Feedback__7A6B2B8C0E7D03BC", x => x.feedback_id);
                    table.ForeignKey(
                        name: "FK__Feedback__order___03F0984C",
                        column: x => x.order_id,
                        principalTable: "Orders",
                        principalColumn: "order_id");
                });

            migrationBuilder.CreateTable(
                name: "Order_detail",
                columns: table => new
                {
                    order_detail_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    service_package_id = table.Column<int>(type: "int", nullable: false),
                    medical_staff_id = table.Column<int>(type: "int", nullable: false),
                    order_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Order_de__3C5A4080DFAAB342", x => x.order_detail_id);
                    table.ForeignKey(
                        name: "FK__Order_det__medic__68487DD7",
                        column: x => x.medical_staff_id,
                        principalTable: "USERS",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Order_det__order__6754599E",
                        column: x => x.order_id,
                        principalTable: "Orders",
                        principalColumn: "order_id");
                    table.ForeignKey(
                        name: "FK__Order_det__servi__66603565",
                        column: x => x.service_package_id,
                        principalTable: "Service_package",
                        principalColumn: "service_package_id");
                });

            migrationBuilder.CreateTable(
                name: "Payment",
                columns: table => new
                {
                    payment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_id = table.Column<int>(type: "int", nullable: false),
                    payment_method = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    payment_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    payment_date = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    total = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Payment__ED1FC9EAF2FC902D", x => x.payment_id);
                    table.ForeignKey(
                        name: "FK__Payment__order_i__76969D2E",
                        column: x => x.order_id,
                        principalTable: "Orders",
                        principalColumn: "order_id");
                });

            migrationBuilder.CreateTable(
                name: "Feedback_response",
                columns: table => new
                {
                    response_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    feedback_id = table.Column<int>(type: "int", nullable: false),
                    staff_id = table.Column<int>(type: "int", nullable: false),
                    content_response = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    create_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    update_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Feedback__EBECD896729DDB04", x => x.response_id);
                    table.ForeignKey(
                        name: "FK__Feedback___feedb__08B54D69",
                        column: x => x.feedback_id,
                        principalTable: "Feedback",
                        principalColumn: "feedback_id");
                    table.ForeignKey(
                        name: "FK__Feedback___staff__09A971A2",
                        column: x => x.staff_id,
                        principalTable: "USERS",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Delivery_task",
                columns: table => new
                {
                    task_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_detail_id = table.Column<int>(type: "int", nullable: false),
                    manager_id = table.Column<int>(type: "int", nullable: false),
                    staff_id = table.Column<int>(type: "int", nullable: false),
                    assigned_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    delivery_task_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    complete_at = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Delivery__0492148D46A0B8FD", x => x.task_id);
                    table.ForeignKey(
                        name: "FK__Delivery___manag__151B244E",
                        column: x => x.manager_id,
                        principalTable: "USERS",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Delivery___order__14270015",
                        column: x => x.order_detail_id,
                        principalTable: "Order_detail",
                        principalColumn: "order_detail_id");
                    table.ForeignKey(
                        name: "FK__Delivery___staff__160F4887",
                        column: x => x.staff_id,
                        principalTable: "USERS",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Result",
                columns: table => new
                {
                    result_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_detail_id = table.Column<int>(type: "int", nullable: false),
                    report_date = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    test_summary = table.Column<string>(type: "text", nullable: true),
                    raw_data_path = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    report_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    result_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    create_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    update_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Result__AFB3C316A7FD1A4C", x => x.result_id);
                    table.ForeignKey(
                        name: "FK__Result__order_de__10566F31",
                        column: x => x.order_detail_id,
                        principalTable: "Order_detail",
                        principalColumn: "order_detail_id");
                });

            migrationBuilder.CreateTable(
                name: "Sample_kit",
                columns: table => new
                {
                    sample_kit_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_detail_id = table.Column<int>(type: "int", nullable: false),
                    staff_id = table.Column<int>(type: "int", nullable: false),
                    name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    intruction_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    kit_code = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    create_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    update_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    send_date = table.Column<DateOnly>(type: "date", nullable: true),
                    received_date = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Sample_k__0BEC49D5E56EEC1C", x => x.sample_kit_id);
                    table.ForeignKey(
                        name: "FK__Sample_ki__order__7C4F7684",
                        column: x => x.order_detail_id,
                        principalTable: "Order_detail",
                        principalColumn: "order_detail_id");
                    table.ForeignKey(
                        name: "FK__Sample_ki__staff__7D439ABD",
                        column: x => x.staff_id,
                        principalTable: "USERS",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "samples",
                columns: table => new
                {
                    sample_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    participant_id = table.Column<int>(type: "int", nullable: true),
                    sample_type_id = table.Column<int>(type: "int", nullable: false),
                    staff_id = table.Column<int>(type: "int", nullable: false),
                    order_detail_id = table.Column<int>(type: "int", nullable: false),
                    collected_date = table.Column<DateOnly>(type: "date", nullable: true),
                    received_date = table.Column<DateOnly>(type: "date", nullable: true),
                    sample_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__samples__84ACF7BAFBEADC56", x => x.sample_id);
                    table.ForeignKey(
                        name: "FK__samples__order_d__71D1E811",
                        column: x => x.order_detail_id,
                        principalTable: "Order_detail",
                        principalColumn: "order_detail_id");
                    table.ForeignKey(
                        name: "FK__samples__partici__6EF57B66",
                        column: x => x.participant_id,
                        principalTable: "Participant",
                        principalColumn: "participant_id");
                    table.ForeignKey(
                        name: "FK__samples__sample___6FE99F9F",
                        column: x => x.sample_type_id,
                        principalTable: "Sample_type",
                        principalColumn: "sample_type_id");
                    table.ForeignKey(
                        name: "FK__samples__staff_i__70DDC3D8",
                        column: x => x.staff_id,
                        principalTable: "USERS",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Choose_method_collection_method_id",
                table: "Choose_method",
                column: "collection_method_id");

            migrationBuilder.CreateIndex(
                name: "IX_Choose_method_service_package_id",
                table: "Choose_method",
                column: "service_package_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Collecti__2DA2FAEEBDD685A8",
                table: "Collection_method",
                column: "method_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Delivery__46596228E2A38323",
                table: "Delivery",
                column: "order_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Delivery_task_manager_id",
                table: "Delivery_task",
                column: "manager_id");

            migrationBuilder.CreateIndex(
                name: "IX_Delivery_task_order_detail_id",
                table: "Delivery_task",
                column: "order_detail_id");

            migrationBuilder.CreateIndex(
                name: "IX_Delivery_task_staff_id",
                table: "Delivery_task",
                column: "staff_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Feedback__465962288B5DC2EA",
                table: "Feedback",
                column: "order_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_response_feedback_id",
                table: "Feedback_response",
                column: "feedback_id");

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_response_staff_id",
                table: "Feedback_response",
                column: "staff_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_detail_medical_staff_id",
                table: "Order_detail",
                column: "medical_staff_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_detail_order_id",
                table: "Order_detail",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_detail_service_package_id",
                table: "Order_detail",
                column: "service_package_id");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_customer_id",
                table: "Orders",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Orders__1B185E46F0C25976",
                table: "Orders",
                column: "collection_method_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Payment__46596228D091F1C1",
                table: "Payment",
                column: "order_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Permissi__81C0F5A2AF37A695",
                table: "Permission",
                column: "permission_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Result__3C5A4081DA9B3E92",
                table: "Result",
                column: "order_detail_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Role_Permission_permission_id",
                table: "Role_Permission",
                column: "permission_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Roles__783254B1590D0F6A",
                table: "Roles",
                column: "role_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sample_kit_order_detail_id",
                table: "Sample_kit",
                column: "order_detail_id");

            migrationBuilder.CreateIndex(
                name: "IX_Sample_kit_staff_id",
                table: "Sample_kit",
                column: "staff_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Sample_k__24769816AA225B49",
                table: "Sample_kit",
                column: "kit_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sample_transfer_medical_staff_id",
                table: "Sample_transfer",
                column: "medical_staff_id");

            migrationBuilder.CreateIndex(
                name: "IX_Sample_transfer_staff_id",
                table: "Sample_transfer",
                column: "staff_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Sample_t__72E12F1B25024A15",
                table: "Sample_type",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_samples_order_detail_id",
                table: "samples",
                column: "order_detail_id");

            migrationBuilder.CreateIndex(
                name: "IX_samples_participant_id",
                table: "samples",
                column: "participant_id");

            migrationBuilder.CreateIndex(
                name: "IX_samples_sample_type_id",
                table: "samples",
                column: "sample_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_samples_staff_id",
                table: "samples",
                column: "staff_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Service___4A8EDF39854693FF",
                table: "Service_package",
                column: "service_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Service_price_service_package_id",
                table: "Service_price",
                column: "service_package_id");

            migrationBuilder.CreateIndex(
                name: "UQ__User_pro__AB6E61644B4B6EFE",
                table: "User_profile",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__User_pro__B9BE370E70888B0C",
                table: "User_profile",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_USERS_role_id",
                table: "USERS",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "UQ__USERS__AB6E61645513B201",
                table: "USERS",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Choose_method");

            migrationBuilder.DropTable(
                name: "Delivery");

            migrationBuilder.DropTable(
                name: "Delivery_task");

            migrationBuilder.DropTable(
                name: "Feedback_response");

            migrationBuilder.DropTable(
                name: "Payment");

            migrationBuilder.DropTable(
                name: "Result");

            migrationBuilder.DropTable(
                name: "Role_Permission");

            migrationBuilder.DropTable(
                name: "Sample_kit");

            migrationBuilder.DropTable(
                name: "Sample_transfer");

            migrationBuilder.DropTable(
                name: "samples");

            migrationBuilder.DropTable(
                name: "Service_price");

            migrationBuilder.DropTable(
                name: "User_profile");

            migrationBuilder.DropTable(
                name: "Feedback");

            migrationBuilder.DropTable(
                name: "Permission");

            migrationBuilder.DropTable(
                name: "Order_detail");

            migrationBuilder.DropTable(
                name: "Participant");

            migrationBuilder.DropTable(
                name: "Sample_type");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Service_package");

            migrationBuilder.DropTable(
                name: "Collection_method");

            migrationBuilder.DropTable(
                name: "USERS");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
