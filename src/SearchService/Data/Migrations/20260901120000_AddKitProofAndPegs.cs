using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using SearchService.Data;

#nullable disable

namespace SearchService.Data.Migrations
{
    [DbContext(typeof(SearchDbContext))]
    [Migration("20260901120000_AddKitProofAndPegs")]
    public partial class AddKitProofAndPegs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(name: "CollarPhotoUrl", table: "Items", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<string>(name: "WashPhotoUrl", table: "Items", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<string>(name: "LabelPhotoUrl", table: "Items", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<string>(name: "CoaUrl", table: "Items", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<string>(name: "VerifiedBy", table: "Items", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<DateTime>(name: "VerifiedAt", table: "Items", type: "TEXT", nullable: true);

            migrationBuilder.CreateTable(
                name: "SavedPegs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Username = table.Column<string>(type: "TEXT", nullable: false),
                    Club = table.Column<string>(type: "TEXT", nullable: true),
                    League = table.Column<string>(type: "TEXT", nullable: true),
                    Size = table.Column<string>(type: "TEXT", nullable: true),
                    KitType = table.Column<string>(type: "TEXT", nullable: true),
                    Status = table.Column<string>(type: "TEXT", nullable: true),
                    MinPrice = table.Column<int>(type: "INTEGER", nullable: true),
                    MaxPrice = table.Column<int>(type: "INTEGER", nullable: true),
                    HungAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table => table.PrimaryKey("PK_SavedPegs", x => x.Id));

            migrationBuilder.CreateIndex(name: "IX_SavedPegs_Username", table: "SavedPegs", column: "Username");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "SavedPegs");
            migrationBuilder.DropColumn(name: "CollarPhotoUrl", table: "Items");
            migrationBuilder.DropColumn(name: "WashPhotoUrl", table: "Items");
            migrationBuilder.DropColumn(name: "LabelPhotoUrl", table: "Items");
            migrationBuilder.DropColumn(name: "CoaUrl", table: "Items");
            migrationBuilder.DropColumn(name: "VerifiedBy", table: "Items");
            migrationBuilder.DropColumn(name: "VerifiedAt", table: "Items");
        }
    }
}
