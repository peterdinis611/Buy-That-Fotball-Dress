using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using SearchService.Data;

#nullable disable

namespace SearchService.Data.Migrations
{
    [DbContext(typeof(SearchDbContext))]
    [Migration("20260830120000_AddItemProvenance")]
    public partial class AddItemProvenance : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(name: "Match", table: "Items", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<DateTime>(name: "MatchDate", table: "Items", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<string>(name: "Opponent", table: "Items", type: "TEXT", nullable: true);
            migrationBuilder.AddColumn<string>(name: "PitchPhotoUrl", table: "Items", type: "TEXT", nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Match", table: "Items");
            migrationBuilder.DropColumn(name: "MatchDate", table: "Items");
            migrationBuilder.DropColumn(name: "Opponent", table: "Items");
            migrationBuilder.DropColumn(name: "PitchPhotoUrl", table: "Items");
        }
    }
}
