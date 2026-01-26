using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using NovaWallet.Infrastructure.Persistence;

#nullable disable

namespace NovaWallet.Infrastructure.Migrations
{
    [DbContext(typeof(NovaWalletDbContext))]
    [Migration("20260126120000_AddUserDateOfBirth")]
    public partial class AddUserDateOfBirth : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Users",
                type: "date",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Users");
        }
    }
}
