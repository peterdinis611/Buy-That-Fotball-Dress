using AuctionService.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuctionService.Data.Migrations
{
    [DbContext(typeof(AuctionDbContext))]
    [Migration("20260901120000_AddKitProof")]
    public partial class AddKitProof : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(name: "CollarPhotoUrl", table: "Item", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<string>(name: "WashPhotoUrl", table: "Item", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<string>(name: "LabelPhotoUrl", table: "Item", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<string>(name: "CoaUrl", table: "Item", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<string>(name: "VerifiedBy", table: "Item", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<DateTime>(name: "VerifiedAt", table: "Item", type: "TEXT", nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "CollarPhotoUrl", table: "Item");
            migrationBuilder.DropColumn(name: "WashPhotoUrl", table: "Item");
            migrationBuilder.DropColumn(name: "LabelPhotoUrl", table: "Item");
            migrationBuilder.DropColumn(name: "CoaUrl", table: "Item");
            migrationBuilder.DropColumn(name: "VerifiedBy", table: "Item");
            migrationBuilder.DropColumn(name: "VerifiedAt", table: "Item");
        }
    }
}
