using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

public partial class BloodlineDnaContext : DbContext
{
    public BloodlineDnaContext()
    {
    }

    public BloodlineDnaContext(DbContextOptions<BloodlineDnaContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ChooseMethod> ChooseMethods { get; set; }

    public virtual DbSet<CollectionMethod> CollectionMethods { get; set; }

    public virtual DbSet<Delivery> Deliveries { get; set; }

    public virtual DbSet<DeliveryTask> DeliveryTasks { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<FeedbackResponse> FeedbackResponses { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Participant> Participants { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<Result> Results { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Sample> Samples { get; set; }

    public virtual DbSet<SampleKit> SampleKits { get; set; }

    public virtual DbSet<SampleTransfer> SampleTransfers { get; set; }

    public virtual DbSet<SampleType> SampleTypes { get; set; }

    public virtual DbSet<ServicePackage> ServicePackages { get; set; }

    public virtual DbSet<ServicePrice> ServicePrices { get; set; }

    public virtual DbSet<TestType> TestTypes { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserProfile> UserProfiles { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("name=Default");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ChooseMethod>(entity =>
        {
            entity.HasOne(d => d.CollectionMethod).WithMany().HasConstraintName("FK__Choose_me__colle__5BE2A6F2");

            entity.HasOne(d => d.ServicePackage).WithMany().HasConstraintName("FK__Choose_me__servi__5AEE82B9");
        });

        modelBuilder.Entity<CollectionMethod>(entity =>
        {
            entity.HasKey(e => e.CollectionMethodId).HasName("PK__Collecti__1B185E4734722523");

            entity.Property(e => e.CollectionMethodId).ValueGeneratedNever();

            entity.HasOne(d => d.TestType).WithMany(p => p.CollectionMethods)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Collectio__TestT__5535A963");
        });

        modelBuilder.Entity<Delivery>(entity =>
        {
            entity.HasKey(e => e.DeliveryId).HasName("PK__Delivery__1C5CF4F5BDE9DEA5");

            entity.HasOne(d => d.Order).WithOne(p => p.Delivery)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery__order___6D0D32F4");
        });

        modelBuilder.Entity<DeliveryTask>(entity =>
        {
            entity.HasKey(e => e.TaskId).HasName("PK__Delivery__0492148D9A40D64D");

            entity.Property(e => e.AssignedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Manager).WithMany(p => p.DeliveryTaskManagers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery___manag__160F4887");

            entity.HasOne(d => d.OrderDetail).WithMany(p => p.DeliveryTasks)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery___order__151B244E");

            entity.HasOne(d => d.Staff).WithMany(p => p.DeliveryTaskStaffs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery___staff__17036CC0");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__Feedback__7A6B2B8CD2060417");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Order).WithOne(p => p.Feedback)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Feedback__order___04E4BC85");
        });

        modelBuilder.Entity<FeedbackResponse>(entity =>
        {
            entity.HasKey(e => e.ResponseId).HasName("PK__Feedback__EBECD896E39140DA");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Feedback).WithMany(p => p.FeedbackResponses)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Feedback___feedb__09A971A2");

            entity.HasOne(d => d.Staff).WithMany(p => p.FeedbackResponses)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Feedback___staff__0A9D95DB");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Orders__465962295517D119");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.CollectionMethod).WithMany(p => p.Orders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Orders__collecti__6477ECF3");

            entity.HasOne(d => d.Customer).WithMany(p => p.Orders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Orders__customer__6383C8BA");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PK__Order_de__3C5A4080184BA151");

            entity.HasOne(d => d.MedicalStaff).WithMany(p => p.OrderDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Order_det__medic__693CA210");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Order_det__order__68487DD7");

            entity.HasOne(d => d.ServicePackage).WithMany(p => p.OrderDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Order_det__servi__6754599E");
        });

        modelBuilder.Entity<Participant>(entity =>
        {
            entity.HasKey(e => e.ParticipantId).HasName("PK__Particip__4E0378060168E6D6");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payment__ED1FC9EA0F2E2FEB");

            entity.Property(e => e.PaymentDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Order).WithOne(p => p.Payment)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Payment__order_i__778AC167");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.PermissionId).HasName("PK__Permissi__E5331AFA892A52EE");
        });

        modelBuilder.Entity<Result>(entity =>
        {
            entity.HasKey(e => e.ResultId).HasName("PK__Result__AFB3C316EAC1C4E0");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ReportDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.OrderDetail).WithOne(p => p.Result)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Result__order_de__114A936A");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__760965CCB71068A6");

            entity.HasMany(d => d.Permissions).WithMany(p => p.Roles)
                .UsingEntity<Dictionary<string, object>>(
                    "RolePermission",
                    r => r.HasOne<Permission>().WithMany()
                        .HasForeignKey("PermissionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Role_Perm__permi__4AB81AF0"),
                    l => l.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Role_Perm__role___49C3F6B7"),
                    j =>
                    {
                        j.HasKey("RoleId", "PermissionId").HasName("PK__Role_Per__C85A546316F63143");
                        j.ToTable("Role_Permission");
                        j.IndexerProperty<int>("RoleId").HasColumnName("role_id");
                        j.IndexerProperty<int>("PermissionId").HasColumnName("permission_id");
                    });
        });

        modelBuilder.Entity<Sample>(entity =>
        {
            entity.HasKey(e => e.SampleId).HasName("PK__samples__84ACF7BA057FCED1");

            entity.HasOne(d => d.OrderDetail).WithMany(p => p.Samples)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__samples__order_d__72C60C4A");

            entity.HasOne(d => d.Participant).WithMany(p => p.Samples).HasConstraintName("FK__samples__partici__6FE99F9F");

            entity.HasOne(d => d.SampleType).WithMany(p => p.Samples)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__samples__sample___70DDC3D8");

            entity.HasOne(d => d.Staff).WithMany(p => p.Samples)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__samples__staff_i__71D1E811");
        });

        modelBuilder.Entity<SampleKit>(entity =>
        {
            entity.HasKey(e => e.SampleKitId).HasName("PK__Sample_k__0BEC49D5872985A7");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.OrderDetail).WithMany(p => p.SampleKits)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_ki__order__7D439ABD");

            entity.HasOne(d => d.Staff).WithMany(p => p.SampleKits)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_ki__staff__7E37BEF6");
        });

        modelBuilder.Entity<SampleTransfer>(entity =>
        {
            entity.HasKey(e => e.TransferId).HasName("PK__Sample_t__78E6FD332ADEEB4E");

            entity.Property(e => e.TransferDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MedicalStaff).WithMany(p => p.SampleTransferMedicalStaffs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_tr__medic__1BC821DD");

            entity.HasOne(d => d.Sample).WithMany(p => p.SampleTransfers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_tr__sampl__1CBC4616");

            entity.HasOne(d => d.Staff).WithMany(p => p.SampleTransferStaffs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_tr__staff__1AD3FDA4");
        });

        modelBuilder.Entity<SampleType>(entity =>
        {
            entity.HasKey(e => e.SampleTypeId).HasName("PK__Sample_t__52C648966CC9F9A3");
        });

        modelBuilder.Entity<ServicePackage>(entity =>
        {
            entity.HasKey(e => e.ServicePackageId).HasName("PK__Service___968593275A55CD21");

            entity.Property(e => e.ServicePackageId).ValueGeneratedNever();
        });

        modelBuilder.Entity<ServicePrice>(entity =>
        {
            entity.HasKey(e => e.ServicePriceId).HasName("PK__Service___B715FBB763536432");

            entity.Property(e => e.ServicePriceId).ValueGeneratedNever();

            entity.HasOne(d => d.ServicePackage).WithMany(p => p.ServicePrices)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Service_p__servi__5EBF139D");
        });

        modelBuilder.Entity<TestType>(entity =>
        {
            entity.HasKey(e => e.TestTypeId).HasName("PK__TestType__9BB8764660B7205D");

            entity.Property(e => e.TestTypeId).ValueGeneratedNever();
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__USERS__B9BE370FDB44ECAD");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Role).WithMany(p => p.Users).HasConstraintName("FK__USERS__role_id__403A8C7D");
        });

        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.ProfileId).HasName("PK__User_pro__AEBB701F700521FB");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.User).WithOne(p => p.UserProfile)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__User_prof__user___46E78A0C");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
