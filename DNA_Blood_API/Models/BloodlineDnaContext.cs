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

    public virtual DbSet<Locu> Locus { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<Participant> Participants { get; set; }

    public virtual DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

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

    public virtual DbSet<ShiftAssignment> ShiftAssignments { get; set; }

    public virtual DbSet<TestLocusResult> TestLocusResults { get; set; }

    public virtual DbSet<TestType> TestTypes { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserProfile> UserProfiles { get; set; }

    public virtual DbSet<WorkShift> WorkShifts { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("name=Default");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ChooseMethod>(entity =>
        {
            entity.HasOne(d => d.CollectionMethod).WithMany().HasConstraintName("FK__Choose_me__colle__66603565");

            entity.HasOne(d => d.ServicePackage).WithMany().HasConstraintName("FK__Choose_me__servi__656C112C");
        });

        modelBuilder.Entity<CollectionMethod>(entity =>
        {
            entity.HasKey(e => e.CollectionMethodId).HasName("PK__Collecti__1B185E4714ABAD2E");

            entity.Property(e => e.CollectionMethodId).ValueGeneratedNever();

            entity.HasOne(d => d.TestType).WithMany(p => p.CollectionMethods)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Collectio__TestT__5EBF139D");
        });

        modelBuilder.Entity<Delivery>(entity =>
        {
            entity.HasKey(e => e.DeliveryId).HasName("PK__Delivery__1C5CF4F57977FA40");

            entity.HasOne(d => d.Order).WithOne(p => p.Delivery)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery__order___76969D2E");
        });

        modelBuilder.Entity<DeliveryTask>(entity =>
        {
            entity.HasKey(e => e.TaskId).HasName("PK__Delivery__0492148D203B93C6");

            entity.Property(e => e.AssignedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Manager).WithMany(p => p.DeliveryTaskManagers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery___manag__2645B050");

            entity.HasOne(d => d.OrderDetail).WithMany(p => p.DeliveryTasks)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery___order__25518C17");

            entity.HasOne(d => d.Staff).WithMany(p => p.DeliveryTaskStaffs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Delivery___staff__2739D489");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__Feedback__7A6B2B8C74CB9385");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Order).WithOne(p => p.Feedback)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Feedback__order___0E6E26BF");
        });

        modelBuilder.Entity<FeedbackResponse>(entity =>
        {
            entity.HasKey(e => e.ResponseId).HasName("PK__Feedback__EBECD8965D68ACD8");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Feedback).WithMany(p => p.FeedbackResponses)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Feedback___feedb__1332DBDC");

            entity.HasOne(d => d.Staff).WithMany(p => p.FeedbackResponses)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Feedback___staff__14270015");
        });

        modelBuilder.Entity<Locu>(entity =>
        {
            entity.HasKey(e => e.LocusId).HasName("PK__Locus__28DB691E4FEA3140");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Orders__465962299AAC0767");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.CollectionMethod).WithMany(p => p.Orders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Orders__collecti__6E01572D");

            entity.HasOne(d => d.Customer).WithMany(p => p.Orders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Orders__customer__6D0D32F4");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PK__Order_de__3C5A40806B72521D");

            entity.HasOne(d => d.MedicalStaff).WithMany(p => p.OrderDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Order_det__medic__72C60C4A");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Order_det__order__71D1E811");

            entity.HasOne(d => d.ServicePackage).WithMany(p => p.OrderDetails)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Order_det__servi__70DDC3D8");
        });

        modelBuilder.Entity<Participant>(entity =>
        {
            entity.HasKey(e => e.ParticipantId).HasName("PK__Particip__4E03780668D3B615");
        });

        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Password__3213E83F570662B2");

            entity.Property(e => e.IsUsed).HasDefaultValue(false);

            entity.HasOne(d => d.User).WithMany(p => p.PasswordResetTokens)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PasswordResetToken_User");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payment__ED1FC9EA97C2E49D");

            entity.Property(e => e.PaymentDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Order).WithOne(p => p.Payment)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Payment__order_i__01142BA1");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.PermissionId).HasName("PK__Permissi__E5331AFAF4248803");
        });

        modelBuilder.Entity<Result>(entity =>
        {
            entity.HasKey(e => e.ResultId).HasName("PK__Result__AFB3C31679D0F6BB");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ReportDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.OrderDetail).WithOne(p => p.Result)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Result__order_de__1DB06A4F");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__760965CC378488A2");

            entity.HasMany(d => d.Permissions).WithMany(p => p.Roles)
                .UsingEntity<Dictionary<string, object>>(
                    "RolePermission",
                    r => r.HasOne<Permission>().WithMany()
                        .HasForeignKey("PermissionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Role_Perm__permi__5441852A"),
                    l => l.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Role_Perm__role___534D60F1"),
                    j =>
                    {
                        j.HasKey("RoleId", "PermissionId").HasName("PK__Role_Per__C85A54637093A0EF");
                        j.ToTable("Role_Permission");
                        j.IndexerProperty<int>("RoleId").HasColumnName("role_id");
                        j.IndexerProperty<int>("PermissionId").HasColumnName("permission_id");
                    });
        });

        modelBuilder.Entity<Sample>(entity =>
        {
            entity.HasKey(e => e.SampleId).HasName("PK__samples__84ACF7BAE6BE64D0");

            entity.HasOne(d => d.OrderDetail).WithMany(p => p.Samples)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__samples__order_d__7C4F7684");

            entity.HasOne(d => d.Participant).WithMany(p => p.Samples).HasConstraintName("FK__samples__partici__797309D9");

            entity.HasOne(d => d.SampleType).WithMany(p => p.Samples)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__samples__sample___7A672E12");

            entity.HasOne(d => d.Staff).WithMany(p => p.Samples)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__samples__staff_i__7B5B524B");
        });

        modelBuilder.Entity<SampleKit>(entity =>
        {
            entity.HasKey(e => e.SampleKitId).HasName("PK__Sample_k__0BEC49D5B43CC85F");

            entity.Property(e => e.CreateAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdateAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.OrderDetail).WithMany(p => p.SampleKits)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_ki__order__06CD04F7");

            entity.HasOne(d => d.Staff).WithMany(p => p.SampleKits)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_ki__staff__07C12930");
        });

        modelBuilder.Entity<SampleTransfer>(entity =>
        {
            entity.HasKey(e => e.TransferId).HasName("PK__Sample_t__78E6FD33554D245E");

            entity.Property(e => e.TransferDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MedicalStaff).WithMany(p => p.SampleTransferMedicalStaffs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_tr__medic__2BFE89A6");

            entity.HasOne(d => d.Sample).WithMany(p => p.SampleTransfers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_tr__sampl__2CF2ADDF");

            entity.HasOne(d => d.Staff).WithMany(p => p.SampleTransferStaffs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sample_tr__staff__2B0A656D");
        });

        modelBuilder.Entity<SampleType>(entity =>
        {
            entity.HasKey(e => e.SampleTypeId).HasName("PK__Sample_t__52C648963A3F0B93");
        });

        modelBuilder.Entity<ServicePackage>(entity =>
        {
            entity.HasKey(e => e.ServicePackageId).HasName("PK__Service___96859327F959D9F0");
        });

        modelBuilder.Entity<ServicePrice>(entity =>
        {
            entity.HasKey(e => e.ServicePriceId).HasName("PK__Service___B715FBB72F20A1AE");

            entity.Property(e => e.ServicePriceId).ValueGeneratedNever();

            entity.HasOne(d => d.ServicePackage).WithMany(p => p.ServicePrices)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Service_p__servi__693CA210");
        });

        modelBuilder.Entity<ShiftAssignment>(entity =>
        {
            entity.HasKey(e => e.AssignmentId).HasName("PK__ShiftAss__DA89181425FE74B8");

            entity.HasOne(d => d.Shift).WithMany(p => p.ShiftAssignments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ShiftAssi__shift__45F365D3");

            entity.HasOne(d => d.User).WithMany(p => p.ShiftAssignments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ShiftAssi__user___44FF419A");
        });

        modelBuilder.Entity<TestLocusResult>(entity =>
        {
            entity.HasKey(e => e.TestLocusId).HasName("PK__Test_Loc__73699DAE14CEBC5E");

            entity.HasOne(d => d.Locus).WithMany(p => p.TestLocusResults)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Test_Locu__locus__2180FB33");

            entity.HasOne(d => d.Result).WithMany(p => p.TestLocusResults)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Test_Locu__resul__208CD6FA");
        });

        modelBuilder.Entity<TestType>(entity =>
        {
            entity.HasKey(e => e.TestTypeId).HasName("PK__TestType__9BB8764671502B4C");

            entity.Property(e => e.TestTypeId).ValueGeneratedNever();
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__USERS__B9BE370F406DA482");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Role).WithMany(p => p.Users).HasConstraintName("FK__USERS__role_id__4222D4EF");
        });

        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.ProfileId).HasName("PK__User_pro__AEBB701FA4084492");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.User).WithOne(p => p.UserProfile)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__User_prof__user___5070F446");
        });

        modelBuilder.Entity<WorkShift>(entity =>
        {
            entity.HasKey(e => e.ShiftId).HasName("PK__WorkShif__7B267220E12C8F89");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
