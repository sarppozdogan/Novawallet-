using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NovaWallet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVirtualIbanAndPaymentCards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VirtualIban",
                table: "Wallets",
                type: "nvarchar(34)",
                maxLength: 34,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "CardId",
                table: "Transactions",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PaymentCards",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    CardToken = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    MaskedPan = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CardHolderName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ExpiryMonth = table.Column<int>(type: "int", nullable: false),
                    ExpiryYear = table.Column<int>(type: "int", nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentCards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentCards_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CardId",
                table: "Transactions",
                column: "CardId");

            migrationBuilder.CreateIndex(
                name: "IX_Wallets_VirtualIban",
                table: "Wallets",
                column: "VirtualIban",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentCards_CardToken",
                table: "PaymentCards",
                column: "CardToken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentCards_UserId",
                table: "PaymentCards",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_PaymentCards_CardId",
                table: "Transactions",
                column: "CardId",
                principalTable: "PaymentCards",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_PaymentCards_CardId",
                table: "Transactions");

            migrationBuilder.DropTable(
                name: "PaymentCards");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_CardId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Wallets_VirtualIban",
                table: "Wallets");

            migrationBuilder.DropColumn(
                name: "CardId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "VirtualIban",
                table: "Wallets");
        }
    }
}
