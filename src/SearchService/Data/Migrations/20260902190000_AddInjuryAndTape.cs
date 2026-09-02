using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using SearchService.Data;

#nullable disable

namespace SearchService.Data.Migrations
{
    [DbContext(typeof(SearchDbContext))]
    [Migration("20260902190000_AddInjuryAndTape")]
    public partial class AddInjuryAndTape : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(name: "Injury", table: "Items", type: "INTEGER", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<int>(name: "PitToPit", table: "Items", type: "INTEGER", nullable: true);
            migrationBuilder.AddColumn<int>(name: "BackLength", table: "Items", type: "INTEGER", nullable: true);
            migrationBuilder.AddColumn<int>(name: "BackNumber", table: "Items", type: "INTEGER", nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Injury", table: "Items");
            migrationBuilder.DropColumn(name: "PitToPit", table: "Items");
            migrationBuilder.DropColumn(name: "BackLength", table: "Items");
            migrationBuilder.DropColumn(name: "BackNumber", table: "Items");
        }
    }
}
